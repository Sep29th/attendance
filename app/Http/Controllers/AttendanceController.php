<?php

namespace App\Http\Controllers;

use App\Events\ScanCardIdEvent;
use App\Events\ScanCardIdResultEvent;
use App\Events\SomeoneAttendance;
use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class AttendanceController extends Controller
{
    public function getListAttendance(Request $request)
    {
        $query = DB::table('attendances as at')
            ->select(['at.checkIn', 'at.checkOut', 'em.name as employeeName', 'em.cardId', 'dei.name as deviceIn', 'deo.name as deviceOut'])
            ->leftJoin('employees as em', 'at.employeeId', '=', 'em.id')
            ->leftJoin('devices as dei', 'at.checkInDeviceId', '=', 'dei.id')
            ->leftJoin('devices as deo', 'at.checkOutDeviceId', '=', 'deo.id')
            ->orderByDesc('at.id');
        if (isset($request->checkInStart) && isset($request->checkOutStart)) {
            $query
                ->whereBetween('at.checkIn', [Carbon::parse($request->checkInStart)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s'), Carbon::parse($request->checkInEnd)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s')])
                ->whereBetween('at.checkOut', [Carbon::parse($request->checkOutStart)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s'), Carbon::parse($request->checkOutEnd)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s')]);
        } else if (isset($request->checkInStart)) {
            $query
                ->whereBetween('at.checkIn', [Carbon::parse($request->checkInStart)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s'), Carbon::parse($request->checkInEnd)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s')]);
        } else if (isset($request->checkOutStart)) {
            $query
                ->whereBetween('at.checkOut', [Carbon::parse($request->checkOutStart)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s'), Carbon::parse($request->checkOutEnd)->setTimezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s')]);
        }

        return $query->get();
    }

    public function getListCalculateMerit(Request $request)
    {
        return DB::table('attendances as at')
            ->select(['em.name AS employeeName', 'em.cardId', 'em.state', DB::raw('SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(at.checkOut, at.checkIn)))) AS workingHour')])
            ->rightJoin('employees as em', 'at.employeeId', '=', 'em.id')
            ->groupBy(['em.name', 'em.cardId', 'em.state'])
            ->orderBy('em.name')
            ->whereYear('at.checkIn', '=', $request->year)
            ->whereYear('at.checkOut', '=', $request->year)
            ->whereMonth('at.checkIn', '=', $request->month)
            ->whereMonth('at.checkOut', '=', $request->month)
            ->get();
    }

    public function handleAttendance(Request $request)
    {
        $value = Redis::get("attendance:device:$request->deviceId");
        if ($value != null && $value > 2) return "Too many request from device!";
        if ($value == null) Redis::set("attendance:device:$request->deviceId", "1", "EX", 60);
        else Redis::incr("attendance:device:$request->deviceId");

        $employee = Employee::query()->where("cardId", "=", $request->cardId)->first();
        if (!isset($employee)) return "Unknown tag!";

        if ($employee->state == false) return "This card has   been locked!";

        $changeName = Str::ascii($employee->name);
        if (strlen($changeName) > 16) $changeName = substr($changeName, 0, 16);
        if (strlen($changeName) < 16) $changeName = str_pad($changeName, 16);

        $lastCheck = Attendance::query()->where("employeeId", "=", $employee->id)->latest('checkIn')->first();
        if ($lastCheck != null && $lastCheck->checkOut == null) {
            if (Carbon::parse($lastCheck->checkIn)->greaterThan(now()->subHours(2))) {
                return "Minimum shift   lasts 2 hours";
            } else {
                $lastCheck->checkOut = now();
                $lastCheck->checkOutDeviceId = $request->deviceId;
                $lastCheck->save();
                event(new SomeoneAttendance());
                return $changeName . "check out!";
            }
        } else {
            $newRecord = new Attendance();
            $newRecord->employeeId = $employee->id;
            $newRecord->checkIn = now();
            $newRecord->checkInDeviceId = $request->deviceId;
            $newRecord->save();
            event(new SomeoneAttendance());
            return $changeName . "check in!";
        }
    }

    public function scanCardId(Request $request)
    {
        event(new ScanCardIdEvent($request->device));
    }

    public function scanResult(Request $request)
    {
        event(new ScanCardIdResultEvent($request->result));
        return "Scan done!";
    }
}
