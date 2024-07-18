<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';

    protected $fillable = [
        'id',
        'name',
        'cardId',
        'state',
        'created_at',
        'updated_at'
    ];

    public function attendances() {
        return $this->hasMany(Attendance::class);
    }
}
