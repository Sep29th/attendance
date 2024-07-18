<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\EmployeeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return \App\Models\User::query()->create([
        'name' => 'admin123456',
        'email' => 'caulata1234@gmail.com',
        'password' => Hash::make('admin123456')
    ])->createToken(time())->plainTextToken;
});

Route::get('/test', [AttendanceController::class, 'getListAttendance']);

Route::post('/login', [AuthController::class, 'login']);

Route::get('/dashboard', [AuthController::class, 'dashboard']);

Route::get('/verify', function () {
    return 'test';
})->middleware('auth:sanctum');

Route::get('/send-state/{id}/{state}', [DeviceController::class, 'getCurrentStateDevice']);

Route::get('/list-device', [DeviceController::class, 'getAllDevice']);

Route::post('/send-state-event', [DeviceController::class, 'sendStateEvent']);

Route::delete('/delete-device/{id}', [DeviceController::class,  'deleteDevice']);

Route::post('/update-device', [DeviceController::class, 'updateDevice']);

Route::post('/create-device', [DeviceController::class, 'createDevice']);

Route::get('/get-state-device/{id}', [DeviceController::class, 'getState'])->withoutMiddleware([ResponseMiddlewareCustom::class]);

Route::get('/list-device/{state}', [DeviceController::class, 'getAllActiveDevice']);




Route::post('/create-employee', [EmployeeController::class, 'createEmployee']);

Route::put('/update-employee', [EmployeeController::class, 'updateEmployee']);

Route::delete('/delete-employee/{id}', [EmployeeController::class, 'deleteEmployee']);

Route::get('/get-all-employee', [EmployeeController::class, 'getAllEmployee']);




Route::get('/list-attendance', [AttendanceController::class, 'getListAttendance']);

Route::get('/list-calculate-merit', [AttendanceController::class, 'getListCalculateMerit']);

Route::get('/handle-attendance', [AttendanceController::class, 'handleAttendance'])->withoutMiddleware([ResponseMiddlewareCustom::class]);

Route::get('/scan-card-id', [AttendanceController::class, 'scanCardId']);

Route::get('/scan-result', [AttendanceController::class, 'scanResult'])->withoutMiddleware([ResponseMiddlewareCustom::class]);
