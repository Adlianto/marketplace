<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    /**
     * Display the public storefront profile and catalog of the store.
     */
    public function show(string $slug): Response
    {
        /** @var Store $store */
        $store = Store::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $products = $store->products()
            ->with(['category'])
            ->latest()
            ->paginate(16);

        $totalProducts = $store->products()->count();
        $avgRating = round((float) ($store->products()->avg('rating') ?? 5.0), 1);

        return Inertia::render('store/show', [
            'store' => $store,
            'products' => $products,
            'stats' => [
                'total_products' => $totalProducts,
                'rating_avg' => $avgRating,
            ],
        ]);
    }
}
