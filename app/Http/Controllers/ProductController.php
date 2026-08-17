<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show($id)
    {
        $product = Product::with(['specifications', 'reviews'])->findOrFail($id);

        $avgRating = $product->reviews->avg('rating') ?? 0;
        $product->rating_avg = round($avgRating, 1);
        $product->reviews_count = $product->reviews->count();

        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(24)
            ->get();

        return Inertia::render('product/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}