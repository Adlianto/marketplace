<?php

namespace App\Http\Requests\Store;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class OpenStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return ! $this->user()?->hasStore();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:100', 'unique:stores,name'],
            'slug' => ['required', 'string', 'min:3', 'max:100', 'unique:stores,slug', 'regex:/^[a-z0-9-]+$/'],
            'city' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:10', 'regex:/^[0-9]+$/'],
            'origin_address' => ['required', 'string', 'min:10', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
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
            'name.required' => 'Nama toko wajib diisi.',
            'name.min' => 'Nama toko minimal harus 3 karakter.',
            'name.max' => 'Nama toko maksimal 100 karakter.',
            'name.unique' => 'Nama toko ini sudah digunakan, silakan pilih nama lain.',
            'slug.required' => 'Domain atau slug toko wajib diisi.',
            'slug.min' => 'Slug toko minimal harus 3 karakter.',
            'slug.max' => 'Slug toko maksimal 100 karakter.',
            'slug.unique' => 'Domain/slug toko sudah digunakan, silakan pilih slug lain.',
            'slug.regex' => 'Slug toko hanya boleh menggunakan huruf kecil, angka, dan tanda hubung (-).',
            'city.required' => 'Kota asal pengiriman wajib diisi.',
            'city.max' => 'Nama kota maksimal 100 karakter.',
            'postal_code.required' => 'Kode pos wajib diisi.',
            'postal_code.regex' => 'Kode pos hanya boleh berisi angka.',
            'postal_code.max' => 'Kode pos maksimal 10 digit.',
            'origin_address.required' => 'Alamat lengkap toko wajib diisi.',
            'origin_address.min' => 'Alamat lengkap toko minimal 10 karakter.',
            'origin_address.max' => 'Alamat lengkap toko maksimal 500 karakter.',
            'description.max' => 'Deskripsi toko maksimal 1000 karakter.',
        ];
    }
}
