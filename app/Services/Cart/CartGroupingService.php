<?php

namespace App\Services\Cart;

use App\Models\Cart;
use Illuminate\Database\Eloquent\Collection;

class CartGroupingService
{
    /**
     * Retrieve and group cart items by store for the given user ID.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getGroupedCart(?int $userId): array
    {
        /** @var Collection<int, Cart> $carts */
        $carts = Cart::with(['product.store', 'sku'])
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->latest()
            ->get();

        return $this->groupCarts($carts);
    }

    /**
     * Group a collection of carts by product.store_id and calculate metrics per store.
     *
     * @param  Collection<int, Cart>  $carts
     * @return array<int, array<string, mixed>>
     */
    public function groupCarts(Collection $carts): array
    {
        $grouped = $carts->groupBy(function (Cart $cart): int {
            return $cart->product?->store_id ?? 0;
        });

        $result = [];

        foreach ($grouped as $storeId => $items) {
            /** @var Cart $firstCart */
            $firstCart = $items->first();
            $store = $firstCart->product?->store;

            $storeData = [
                'id' => (int) ($store?->id ?? $storeId),
                'name' => $store?->name ?? 'Toko Marketplace',
                'slug' => $store?->slug ?? '',
                'city' => $store?->city ?: ($firstCart->product?->city ?? 'Jakarta Pusat'),
                'is_official' => (bool) ($store?->is_official ?? false),
                'power_merchant' => (bool) ($store?->power_merchant ?? false),
                'logo' => $store?->logo,
            ];

            $mappedItems = [];
            $subtotal = 0.0;
            $totalWeightGram = 0;
            $selectedSubtotal = 0.0;
            $selectedWeightGram = 0;
            $selectedCount = 0;

            foreach ($items as $cart) {
                $qty = (int) $cart->quantity;
                $sku = $cart->sku;
                $product = $cart->product;

                $price = (float) ($sku?->price ?? $product?->price ?? 0);
                $originalPrice = $sku?->original_price !== null
                    ? (float) $sku->original_price
                    : ($product?->original_price !== null ? (float) $product->original_price : null);

                $weightGram = (int) ($sku?->weight_gram ?? 200);
                $isSelected = (bool) $cart->selected;

                $itemSubtotal = $price * $qty;
                $itemWeight = $weightGram * $qty;

                $subtotal += $itemSubtotal;
                $totalWeightGram += $itemWeight;

                if ($isSelected) {
                    $selectedSubtotal += $itemSubtotal;
                    $selectedWeightGram += $itemWeight;
                    $selectedCount++;
                }

                $mappedItems[] = [
                    'id' => (int) $cart->id,
                    'user_id' => $cart->user_id ? (int) $cart->user_id : null,
                    'product_id' => (int) $cart->product_id,
                    'product_sku_id' => $cart->product_sku_id ? (int) $cart->product_sku_id : null,
                    'title' => $product?->title ?? 'Produk',
                    'slug' => $product?->slug ?? '',
                    'price' => $price,
                    'original_price' => $originalPrice,
                    'discount' => $product?->discount ? (int) $product->discount : null,
                    'image' => $sku?->image ?: ($product?->image ?? null),
                    'stock' => (int) ($sku?->stock ?? $product?->stock ?? 100),
                    'city' => $storeData['city'],
                    'sku_combination' => $sku?->combination_key,
                    'weight_gram' => $weightGram,
                    'quantity' => $qty,
                    'selected' => $isSelected,
                    'store_id' => $storeData['id'],
                ];
            }

            $totalItems = count($mappedItems);

            $result[] = [
                'store' => $storeData,
                'items' => $mappedItems,
                'subtotal' => $subtotal,
                'total_weight_gram' => $totalWeightGram,
                'selected_subtotal' => $selectedSubtotal,
                'selected_weight_gram' => $selectedWeightGram,
                'selected_count' => $selectedCount,
                'total_items' => $totalItems,
                'is_all_selected' => $totalItems > 0 && $selectedCount === $totalItems,
            ];
        }

        return $result;
    }
}
