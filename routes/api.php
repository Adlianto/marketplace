<?php

use App\Http\Controllers\Api\MidtransWebhookController;
use App\Http\Middleware\VerifyMidtransSignature;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/midtrans/webhook', [MidtransWebhookController::class, 'handle'])
    ->middleware(VerifyMidtransSignature::class)
    ->name('api.midtrans.webhook');
