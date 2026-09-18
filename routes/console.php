<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Automated Marketplace Order Maintenance Jobs
Schedule::command('orders:auto-cancel-unpaid')->hourly();
Schedule::command('orders:auto-cancel-unprocessed')->hourly();
Schedule::command('orders:auto-complete-delivered')->hourly();
