<?php

namespace App\Http\Requests\Seller;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStoreSettingRequest extends FormRequest
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
        $storeId = $this->user()?->store?->id;

        return [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:100',
                Rule::unique('stores', 'name')->ignore($storeId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'city' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:10', 'regex:/^[0-9]+$/'],
            'origin_address' => ['required', 'string', 'min:10', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'status' => ['nullable', 'string', 'in:active,vacation'],
            'logo' => ['nullable', 'string', 'max:500'],
            'banner' => ['nullable', 'string', 'max:500'],
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
            'name.unique' => 'Nama toko ini sudah digunakan toko lain.',
            'city.required' => 'Kota gudang asal wajib diisi.',
            'city.max' => 'Nama kota maksimal 100 karakter.',
            'postal_code.required' => 'Kode pos gudang asal wajib diisi.',
            'postal_code.regex' => 'Kode pos hanya boleh berupa angka.',
            'origin_address.required' => 'Alamat fisik gudang penjemputan wajib diisi.',
            'origin_address.min' => 'Alamat fisik gudang minimal 10 karakter.',
            'origin_address.max' => 'Alamat fisik gudang maksimal 500 karakter.',
            'latitude.between' => 'Koordinat latitude tidak valid (-90 hingga 90).',
            'longitude.between' => 'Koordinat longitude tidak valid (-180 hingga 180).',
            'status.in' => 'Status toko hanya boleh aktif (active) atau libur (vacation).',
        ];
    }
}
