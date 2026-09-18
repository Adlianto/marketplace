<?php

namespace App\Http\Controllers\Seller;

use App\Actions\Product\UpsertProductWithVariantsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductWithVariantsRequest;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class SellerProductController extends Controller
{
    /**
     * Store a newly created product with multi-level variants and SKUs.
     */
    public function store(StoreProductWithVariantsRequest $request, UpsertProductWithVariantsAction $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var Store $store */
        $store = $user->store;

        $action->execute($store, $request->validated());

        return to_route('seller.dashboard')->with('success', 'Produk bervarian berhasil disimpan.');
    }
}
