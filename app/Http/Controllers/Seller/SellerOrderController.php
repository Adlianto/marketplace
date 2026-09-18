<?php

namespace App\Http\Controllers\Seller;

use App\Actions\Order\AcceptSubOrderAction;
use App\Actions\Order\ShipSubOrderAction;
use App\Enums\SubOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\ShipOrderRequest;
use App\Models\Store;
use App\Models\SubOrder;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerOrderController extends Controller
{
    /**
     * Display a listing of sub orders belonging to the merchant's store.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        /** @var Store $store */
        $store = $user->store;

        $status = $request->query('status', 'all');

        $baseQuery = SubOrder::where('store_id', $store->id);

        $counts = [
            'all' => (clone $baseQuery)->count(),
            'paid' => (clone $baseQuery)->where('status', SubOrderStatus::Paid->value)->count(),
            'processing' => (clone $baseQuery)->where('status', SubOrderStatus::Processing->value)->count(),
            'shipped' => (clone $baseQuery)->where('status', SubOrderStatus::Shipped->value)->count(),
            'completed' => (clone $baseQuery)->where('status', SubOrderStatus::Completed->value)->count(),
            'cancelled' => (clone $baseQuery)->where('status', SubOrderStatus::Cancelled->value)->count(),
        ];

        $ordersQuery = SubOrder::with([
            'items.product',
            'items.sku',
            'address',
            'user',
            'orderGroup',
            'disputeTicket',
        ])
            ->where('store_id', $store->id)
            ->latest();

        if ($status !== 'all' && in_array($status, SubOrderStatus::values(), true)) {
            $ordersQuery->where('status', $status);
        }

        $orders = $ordersQuery->paginate(10)->withQueryString();

        return Inertia::render('seller/orders/index', [
            'store' => $store,
            'orders' => $orders,
            'current_status' => $status,
            'counts' => $counts,
        ]);
    }

    /**
     * Accept a paid sub order and start processing.
     */
    public function accept(Request $request, SubOrder $subOrder, AcceptSubOrderAction $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $action->execute($user, $subOrder);

        return back()->with('success', "Pesanan #{$subOrder->sub_order_number} berhasil diterima dan siap diproses.");
    }

    /**
     * Ship a processing sub order with carrier tracking number.
     */
    public function ship(ShipOrderRequest $request, SubOrder $subOrder, ShipSubOrderAction $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $trackingNumber = (string) $request->validated('tracking_number');

        $action->execute($user, $subOrder, $trackingNumber);

        return back()->with('success', "Pesanan #{$subOrder->sub_order_number} berhasil dikirim dengan nomor resi {$trackingNumber}.");
    }
}
