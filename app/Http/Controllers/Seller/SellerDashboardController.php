<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerDashboardController extends Controller
{
    /**
     * Display the seller backoffice dashboard with metrics.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        /** @var Store $store */
        $store = $user->store;

        $activeProductsCount = Product::where('store_id', $store->id)->count();

        $incomingOrdersCount = OrderItem::whereHas('product', fn ($q) => $q->where('store_id', $store->id))
            ->distinct('order_id')
            ->count('order_id');

        $ordersToShipCount = OrderItem::whereHas('product', fn ($q) => $q->where('store_id', $store->id))
            ->whereHas('order', fn ($q) => $q->where('status', 'paid'))
            ->distinct('order_id')
            ->count('order_id');

        return Inertia::render('seller/dashboard', [
            'store' => $store,
            'metrics' => [
                'active_products_count' => $activeProductsCount,
                'incoming_orders_count' => $incomingOrdersCount,
                'orders_to_ship_count' => $ordersToShipCount,
                'wallet_balance' => 0,
            ],
            'recent_products' => $store->products()->latest()->take(5)->get(),
        ]);
    }
}
