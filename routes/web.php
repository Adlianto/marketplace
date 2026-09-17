<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');

// Cart Routes
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
Route::patch('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
Route::post('/cart/toggle-all', [CartController::class, 'toggleAll'])->name('cart.toggleAll');
Route::delete('/cart/selected/delete', [CartController::class, 'destroySelected'])->name('cart.destroySelected');
Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');

// Socialite Auth
Route::get('/auth/google/redirect', [SocialiteController::class, 'redirectToGoogle'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [SocialiteController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// Dashboard & Profile Routes (Auth)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Route Profile & Biodata
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.biodata.update');

    // Route Custom Avatar, Password & PIN
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::post('/profile/password', [ProfileController::class, 'setPassword'])->name('profile.password');
    Route::post('/profile/pin', [ProfileController::class, 'setPin'])->name('profile.pin');
});

if (file_exists(__DIR__.'/settings.php')) {
    require __DIR__.'/settings.php';
}