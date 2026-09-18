<?php

namespace App\Actions\Store;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class OpenStoreAction
{
    /**
     * Open a new merchant store for the specified user.
     *
     * @param  array{
     *     name: string,
     *     slug: string,
     *     city: string,
     *     postal_code: string,
     *     origin_address: string,
     *     description?: string|null
     * }  $data
     */
    public function execute(User $user, array $data): Store
    {
        return DB::transaction(function () use ($user, $data): Store {
            $store = Store::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'slug' => strtolower($data['slug']),
                'city' => $data['city'],
                'postal_code' => $data['postal_code'],
                'origin_address' => $data['origin_address'],
                'description' => $data['description'] ?? null,
                'status' => 'active',
                'is_official' => false,
                'power_merchant' => false,
            ]);

            // Hook for StoreWallet initialization if table/model exists (Phase 9)
            if (class_exists('App\Models\StoreWallet')) {
                /** @var class-string<Model> $walletClass */
                $walletClass = 'App\Models\StoreWallet';
                $walletClass::create([
                    'store_id' => $store->id,
                    'balance' => 0,
                ]);
            }

            return $store;
        });
    }
}
