<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::call(function () {
    DB::statement("
        UPDATE attendances
        SET checkOut = DATE_ADD(checkIn, INTERVAL 2 HOUR), updated_at = CURRENT_TIME
        WHERE checkOut IS NULL
    ");
})->daily();
