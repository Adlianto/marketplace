<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $carts = Cart::with('product')
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->latest()
            ->get();

        if ($carts->isEmpty()) {
            $sampleProducts = Product::take(3)->get();
            foreach ($sampleProducts as $p) {
                Cart::create([
                    'user_id' => $userId,
                    'product_id' => $p->id,
                    'quantity' => 1,
                    'selected' => true,
                ]);
            }
            $carts = Cart::with('product')
                ->when($userId, fn($q) => $q->where('user_id', $userId))
                ->latest()
                ->get();
        }

        // Format data cart
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

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $userId = Auth::id();
        $qty = $request->quantity ?? 1;

        $cart = Cart::where('product_id', $request->product_id)
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->first();

        if ($cart) {
            $cart->increment('quantity', $qty);
        } else {
            Cart::create([
                'user_id' => $userId,
                'product_id' => $request->product_id,
                'quantity' => $qty,
                'selected' => true,
            ]);
        }

        return back();
    }

    public function update(Request $request, $id)
    {
        $cart = Cart::findOrFail($id);

        if ($request->has('quantity')) {
            $cart->update(['quantity' => max(1, (int) $request->quantity)]);
        }

        if ($request->has('selected')) {
            $cart->update(['selected' => (bool) $request->selected]);
        }

        return back();
    }

    public function toggleAll(Request $request)
    {
        $userId = Auth::id();
        $selected = (bool) $request->selected;

        Cart::when($userId, fn($q) => $q->where('user_id', $userId))
            ->update(['selected' => $selected]);

        return back();
    }

    public function destroy($id)
    {
        Cart::findOrFail($id)->delete();
        return back();
    }

    public function destroySelected()
    {
        $userId = Auth::id();
        Cart::when($userId, fn($q) => $q->where('user_id', $userId))
            ->where('selected', true)
            ->delete();

        return back();
    }
}