<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();

        $carts = Cart::with('product')
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->latest()
            ->get();

        $cartItems = $carts->map(function ($cart) {
            return [
                'id' => $cart->id,
                'product_id' => $cart->product->id,
                'title' => $cart->product->title,
                'slug' => $cart->product->slug ?? '',
                'price' => (float) $cart->product->price,
                'original_price' => (float) $cart->product->original_price,
                'discount' => $cart->product->discount,
                'image' => $cart->product->image,
                'stock' => $cart->product->stock ?? 100,
                'city' => $cart->product->city ?? 'Jakarta Pusat',
                'quantity' => $cart->quantity,
                'selected' => (bool) $cart->selected,
            ];
        });

        $recommendations = Product::inRandomOrder()->take(18)->get();

        return Inertia::render('product/cart', [
            'cartItems' => $cartItems,
            'recommendations' => $recommendations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_sku_id' => 'nullable|exists:product_skus,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $userId = Auth::id();
        $qty = (int) ($request->quantity ?? 1);
        $skuId = $request->product_sku_id;

        /** @var Cart|null $cart */
        $cart = Cart::where('product_id', $request->product_id)
            ->where('product_sku_id', $skuId)
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->first();

        if ($cart) {
            $cart->increment('quantity', $qty);
        } else {
            Cart::create([
                'user_id' => $userId,
                'product_id' => $request->product_id,
                'product_sku_id' => $skuId,
                'quantity' => $qty,
                'selected' => true,
            ]);
        }

        return back();
    }

    public function update(Request $request, int|string $id): RedirectResponse
    {
        /** @var Cart $cart */
        $cart = Cart::findOrFail($id);

        if ($cart->user_id !== Auth::id()) {
            abort(403, 'Akses tidak diizinkan.');
        }

        if ($request->has('quantity')) {
            $cart->update(['quantity' => max(1, (int) $request->quantity)]);
        }

        if ($request->has('selected')) {
            $cart->update(['selected' => (bool) $request->selected]);
        }

        return back();
    }

    public function toggleAll(Request $request): RedirectResponse
    {
        $userId = Auth::id();
        $selected = (bool) $request->selected;

        Cart::when($userId, fn ($q) => $q->where('user_id', $userId))
            ->update(['selected' => $selected]);

        return back();
    }

    public function destroy(int|string $id): RedirectResponse
    {
        /** @var Cart $cart */
        $cart = Cart::findOrFail($id);

        if ($cart->user_id !== Auth::id()) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $cart->delete();

        return back();
    }

    public function destroySelected(): RedirectResponse
    {
        $userId = Auth::id();
        Cart::when($userId, fn ($q) => $q->where('user_id', $userId))
            ->where('selected', true)
            ->delete();

        return back();
    }
}
