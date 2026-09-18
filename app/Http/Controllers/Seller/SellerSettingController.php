<?php

namespace App\Http\Controllers\Seller;

use App\Actions\Seller\UpdateStoreSettingAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\UpdateStoreSettingRequest;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerSettingController extends Controller
{
    /**
     * Show the store and warehouse logistics settings form.
     */
    public function edit(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('seller/settings', [
            'store' => $user->store,
        ]);
    }

    /**
     * Update the store profile and origin address settings.
     */
    public function update(UpdateStoreSettingRequest $request, UpdateStoreSettingAction $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var Store $store */
        $store = $user->store;

        $action->execute($store, $request->validated());

        return to_route('seller.settings.edit')->with('success', 'Pengaturan toko dan alamat gudang berhasil diperbarui.');
    }
}
