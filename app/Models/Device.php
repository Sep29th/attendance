<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'devices';

    protected $fillable = [
        'id',
        'name',
        'state',
        'created_at',
        'updated_at'
    ];

    public function attendances() {
        return $this->hasMany(Attendance::class);
    }
}
