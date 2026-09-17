<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $categorySlug = $request->query('category');

        $query = Product::with('category')->latest();

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($categorySlug && $categorySlug !== 'semua') {
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        $products = $query->paginate(24)->withQueryString();
        $categories = Category::select('id', 'name', 'slug')->get();

        return Inertia::render('welcome', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search ?? '',
                'category' => $categorySlug ?? 'semua',
            ],
        ]);
    }
}
