<?php

namespace App\Http\Controllers;

use App\Events\DeleteDeviceEvent;
use App\Events\GetCurrentStateDeviceEvent;
use App\Events\SendCurrentStateEvent;
use App\Events\UpdateStateDeviceEvent;
use App\Exceptions\DeviceExistedException;
use App\Exceptions\DeviceNotFoundException;
use App\Http\Requests\CreateDeviceRequest;
use App\Http\Requests\UpdateDeviceRequest;
use App\Models\Device;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function createDevice(CreateDeviceRequest $request)
    {
        if (Device::query()->where('id', '=', $request->id)->orWhere('name', '=', $request->name)->first())
            throw new DeviceExistedException($request->id, $request->name);

        $newDevice = new Device();
        $newDevice->id = $request->id;
        $newDevice->name = $request->name;
        $newDevice->save();

        return Device::query()->firstWhere('id', '=', $request->id);
    }

    public function updateDevice(UpdateDeviceRequest $request)
    {
        $device = Device::query()->firstWhere('id', '=', $request->id);

        if (!isset($device)) throw new DeviceNotFoundException($request->id);

        if (isset($request->name)) $device->name = $request->name;
        if (isset($request->state)) {
            $device->state = $request->state;
            event(new UpdateStateDeviceEvent($request->id, $request->state));
        }
        $device->save();

        return Device::query()->firstWhere('id', '=', $request->id);
    }

    public function deleteDevice($id)
    {
        $device = Device::query()->firstWhere('id', '=', $id);

        if (!isset($device)) throw new DeviceNotFoundException($id);

        $device->delete();

        event(new DeleteDeviceEvent($id));

        return true;
    }

    public function getAllDevice()
    {
        return Device::all();
    }

    public function getAllActiveDevice($state)
    {
        return Device::query()->where('state', '=', $state)->get();
    }

    public function sendStateEvent()
    {
        event(new SendCurrentStateEvent());
    }

    public function getState($id)
    {
        $device = Device::query()->firstWhere('id', '=', $id);

        if (!isset($device)) return "false";

        if ($device->state == null) {
            $device->state = "available";
            $device->save();
        }

        return $device->state;
    }

    public function getCurrentStateDevice($id, $state)
    {
        event(new GetCurrentStateDeviceEvent($id, $state));
    }
}
