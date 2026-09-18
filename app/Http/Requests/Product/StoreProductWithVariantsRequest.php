<?php

namespace App\Http\Requests\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductWithVariantsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasStore() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Standard Product Attributes
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'image' => ['nullable', 'string', 'max:500'],
            'price' => ['nullable', 'numeric', 'min:0'],

            // Multi-dimensional Variant Attributes (max 2 dimensions)
            'variants' => ['required', 'array', 'min:1', 'max:2'],
            'variants.*.name' => ['required', 'string', 'max:100'],
            'variants.*.options' => ['required', 'array', 'min:1'],

            // Combinatorial SKU Matrix Attributes
            'skus' => ['required', 'array', 'min:1'],
            'skus.*.combination_key' => ['required', 'string', 'max:255'],
            'skus.*.price' => ['required', 'numeric', 'min:1000'],
            'skus.*.original_price' => ['nullable', 'numeric', 'min:1000'],
            'skus.*.stock' => ['required', 'integer', 'min:0'],
            'skus.*.weight_gram' => ['required', 'integer', 'min:1'],
            'skus.*.sku_code' => ['nullable', 'string', 'max:100'],
            'skus.*.image' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get the custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Nama produk wajib diisi.',
            'title.min' => 'Nama produk minimal 3 karakter.',
            'category_id.required' => 'Kategori produk wajib dipilih.',
            'category_id.exists' => 'Kategori produk tidak valid.',
            'variants.required' => 'Varian produk wajib ditentukan.',
            'variants.max' => 'Varian maksimal 2 dimensi (contoh: Warna dan Ukuran).',
            'variants.*.name.required' => 'Nama varian wajib diisi.',
            'variants.*.options.required' => 'Opsi varian wajib diisi minimal 1 pilihan.',
            'skus.required' => 'Daftar SKU varian wajib diisi.',
            'skus.*.combination_key.required' => 'Kombinasi varian SKU wajib ditentukan.',
            'skus.*.price.required' => 'Harga SKU wajib diisi.',
            'skus.*.price.min' => 'Harga SKU minimal Rp 1.000.',
            'skus.*.stock.required' => 'Stok SKU wajib diisi.',
            'skus.*.stock.min' => 'Stok SKU tidak boleh negatif.',
            'skus.*.weight_gram.required' => 'Berat produk per SKU wajib diisi.',
            'skus.*.weight_gram.min' => 'Berat produk minimal 1 gram.',
        ];
    }
}
