<?php

namespace App\Http\Controllers;

use App\Actions\Checkout\ProcessCheckoutAction;
use App\Http\Requests\Checkout\ProcessCheckoutRequest;
use App\Models\Address;
use App\Models\Cart;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    /**
     * Tampilkan halaman ringkasan checkout.
     */
    public function index(): Response|RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $selectedCarts = Cart::with('product')
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
            return (int) $item->product->price * $item->quantity;
        });

        return Inertia::render('checkout/checkoutPage', [
            'items' => $selectedCarts,
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
}
