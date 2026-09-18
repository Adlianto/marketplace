<?php

namespace App\Actions\Seller;

use App\Models\Store;
use Illuminate\Support\Facades\DB;

class UpdateStoreSettingAction
{
    /**
     * Update store profile and origin logistics warehouse address.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(Store $store, array $data): Store
    {
        return DB::transaction(function () use ($store, $data): Store {
            $store->update($data);

            return $store->fresh();
        });
    }
}
