<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendances';

    // public $timestamps = false;

    protected $fillable = [
        'id',
        'checkIn',
        'checkOut',
        'employeeId',
        'checkInDeviceId',
        'checkOutDeviceId'
    ];

    public function employee() {
        return $this->hasOne(Employee::class, 'id', 'id');
    }

    public function checkInDevice() {
        return $this->hasOne(Device::class, 'checkInDeviceId', 'uuid');
    }

    public function checkOutDevice() {
        return $this->hasOne(Device::class, 'checkOutDeviceId', 'uuid');
    }
}
