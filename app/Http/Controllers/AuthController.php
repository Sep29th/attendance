<?php

namespace App\Http\Controllers;

use App\Exceptions\UserNotFoundException;
use App\Http\Requests\LoginRequest;
use App\Models\Attendance;
use App\Models\Device;
use App\Models\Employee;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::query()->firstWhere('name', '=', $request->username);
        if (!isset($user) || !Hash::check($request->password, $user->getAuthPassword())) throw new UserNotFoundException();

        $user->tokens()->delete();
        return [
            'token' => $user->createToken(time())->plainTextToken
        ];
    }

    public function dashboard()
    {
        $dates = [];
        for ($i = 6; $i >= 0; $i--) {
            $dates[] = Carbon::today()->subDays($i)->toDateString();
        }

        $chartQuery = DB::table(DB::raw('(SELECT "' . implode('" AS date UNION SELECT "', $dates) . '" AS date) as all_dates'))
            ->leftJoin('attendances', DB::raw('DATE(attendances.checkIn)'), '=', 'all_dates.date')
            ->select('all_dates.date', DB::raw('COUNT(DISTINCT attendances.employeeId) AS people'))
            ->groupBy('all_dates.date')
            ->get();

        $lastScan = Attendance::query()->latest("updated_at")->first();
        $name = "--";
        $cardId = "--";
        $created_at = "--";

        if ($lastScan != null) {
            $employee = Employee::query()->find($lastScan->employeeId);
            $name = $employee->name;
            $cardId = $employee->cardId;
            $created_at = $employee->created_at;
        }

        $table = DB::table('attendances as at')
            ->select(['at.checkIn', 'at.checkOut', 'em.name as employeeName', 'em.cardId', 'dei.name as deviceIn', 'deo.name as deviceOut'])
            ->leftJoin('employees as em', 'at.employeeId', '=', 'em.id')
            ->leftJoin('devices as dei', 'at.checkInDeviceId', '=', 'dei.id')
            ->leftJoin('devices as deo', 'at.checkOutDeviceId', '=', 'deo.id')
            ->orderByDesc('at.id')
            ->limit(10)
            ->get();

        return [
            "employees" => Employee::query()->count(),
            "devices" => Device::query()->count(),
            "chart" => $chartQuery,
            "lastCard" => [
                ["label" => "Name", "children" => $name, "key" => 1],
                ["label" => "Card ID", "children" => $cardId, "key" => 2],
                ["label" => "Created At", "children" => $created_at, "key" => 3]
            ],
            "table" => $table
        ];
    }
}
