<?php

namespace App\Http\Controllers;

use App\Actions\Checkout\ProcessCheckoutAction;
use App\Actions\Checkout\ProcessMultiStoreCheckoutAction;
use App\Actions\Payment\CreateMidtransSnapTokenAction;
use App\Http\Requests\Checkout\ProcessCheckoutRequest;
use App\Http\Requests\Checkout\ProcessMultiCheckoutRequest;
use App\Models\Address;
use App\Models\Cart;
use App\Models\User;
use App\Services\Cart\CartGroupingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected CartGroupingService $cartGroupingService
    ) {}

    /**
     * Tampilkan halaman ringkasan checkout.
     */
    public function index(): Response|RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $selectedCarts = Cart::with(['product.store', 'sku'])
            ->where('user_id', $user->id)
            ->where('selected', true)
            ->get();

        if ($selectedCarts->isEmpty()) {
            return redirect()->route('cart.index');
        }

        $addresses = Address::where('user_id', $user->id)
            ->orderByDesc('is_main')
            ->latest()
            ->get();

        $itemsSubtotal = $selectedCarts->sum(function (Cart $item): int {
            return (int) ($item->sku?->price ?? $item->product->price) * $item->quantity;
        });

        $storeGroups = $this->cartGroupingService->groupCarts($selectedCarts);

        return Inertia::render('checkout/checkoutPage', [
            'items' => $selectedCarts,
            'storeGroups' => $storeGroups,
            'addresses' => $addresses,
            'summary' => [
                'subtotal' => $itemsSubtotal,
                'shipping_cost' => 15000,
                'grand_total' => $itemsSubtotal + 15000,
            ],
        ]);
    }

    /**
     * Proses checkout dan pembentukan pesanan (Thin Controller).
     */
    public function process(
        ProcessCheckoutRequest $request,
        ProcessCheckoutAction $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $order = $action->execute(
            user: $user,
            addressId: (int) $request->validated('address_id'),
            paymentMethod: (string) $request->validated('payment_method'),
            notes: $request->validated('notes'),
        );

        return redirect()->route('dashboard')->with('success', "Pesanan #{$order->order_number} berhasil dibuat!");
    }

    /**
     * Proses checkout multi-toko (Thin Controller — delegasi ke Action).
     */
    public function processMulti(
        ProcessMultiCheckoutRequest $request,
        ProcessMultiStoreCheckoutAction $action,
        CreateMidtransSnapTokenAction $snapTokenAction,
    ): JsonResponse|RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $orderGroup = $action->execute($user, $request->validated());

        try {
            $snapToken = $snapTokenAction->execute($orderGroup);
        } catch (\Throwable) {
            $snapToken = $orderGroup->snap_token;
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Grup Pesanan #{$orderGroup->group_code} berhasil dibuat!",
                'order_group' => $orderGroup,
                'snap_token' => $snapToken,
            ]);
        }

        return redirect()->route('dashboard')->with('success', "Grup Pesanan #{$orderGroup->group_code} berhasil dibuat!");
    }
}
