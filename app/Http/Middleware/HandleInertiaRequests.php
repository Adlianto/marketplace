<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $userId = Auth::id();
        $cartCount = 0;
        $cartPreview = [];

        try {
            $cartQuery = Cart::with('product')
                ->when($userId, fn ($q) => $q->where('user_id', $userId))
                ->latest();

            $cartCount = (clone $cartQuery)->count();

            $cartPreview = (clone $cartQuery)->take(3)->get()->map(function ($cart) {
                return [
                    'id' => $cart->id,
                    'title' => $cart->product->title ?? 'Produk',
                    'price' => (float) ($cart->product->price ?? 0),
                    'image' => $cart->product->image ?? '',
                ];
            })->toArray();
        } catch (\Throwable $e) {

        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'cart' => [
                'count' => (int) $cartCount,
                'preview' => $cartPreview,
            ],
        ];
    }
}
