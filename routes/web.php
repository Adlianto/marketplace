<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Seller\SellerDashboardController;
use App\Http\Controllers\Seller\SellerSettingController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StorefrontController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

// Public Routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');
Route::get('/toko/{slug}', [StorefrontController::class, 'show'])->name('store.show');

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
    Route::get('dashboard', function (): Response {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('dashboard', [
            'addresses' => $user->addresses()->latest()->get(),
        ]);
    })->name('dashboard');

    // Route Profile & Biodata
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.info.update');

    // Route Custom Avatar, Password & PIN
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::post('/profile/password', [ProfileController::class, 'setPassword'])->name('profile.password');
    Route::post('/profile/pin', [ProfileController::class, 'setPin'])->name('profile.pin');

    // Route Alamat
    Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::patch('/addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::patch('/addresses/{address}/set-main', [AddressController::class, 'setMain'])->name('addresses.setMain');

    // Route Checkout
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'process'])->middleware('throttle:10,1')->name('checkout.process');

    // Route Buka Toko (Merchant Onboarding)
    Route::get('/store/create', [StoreController::class, 'create'])->name('store.create');
    Route::post('/store', [StoreController::class, 'store'])->name('store.store');
});

// Seller Backoffice Routes (Auth & Has Store)
Route::middleware(['auth', 'verified', 'has.store'])->prefix('seller')->name('seller.')->group(function () {
    Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('dashboard');
    Route::get('/settings', [SellerSettingController::class, 'edit'])->name('settings.edit');
    Route::patch('/settings', [SellerSettingController::class, 'update'])->name('settings.update');
});

if (file_exists(__DIR__.'/settings.php')) {
    require __DIR__.'/settings.php';
}
