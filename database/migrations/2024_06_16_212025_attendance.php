<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->dateTime('checkIn')->nullable();
            $table->dateTime('checkOut')->nullable();
            $table->unsignedBigInteger('employeeId')->nullable();
            $table->uuid('checkInDeviceId')->nullable();
            $table->uuid('checkOutDeviceId')->nullable();
            $table->foreign('employeeId')->references('id')->on('employees')->onDelete("cascade");
            $table->foreign('checkInDeviceId')->references('id')->on('devices')->onDelete("cascade");
            $table->foreign('checkOutDeviceId')->references('id')->on('devices')->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
