<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessMultiCheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'address_id' => [
                'required',
                'integer',
                // Anti-IDOR: hanya lolos jika address milik user aktif
                Rule::exists('addresses', 'id')->where(fn ($q) => $q->where('user_id', $userId)),
            ],
            'stores' => ['required', 'array', 'min:1'],
            'stores.*.store_id' => ['required', 'integer', 'exists:stores,id'],
            'stores.*.courier_name' => ['required', 'string', 'in:jne,sicepat,gosend,jnt'],
            'stores.*.courier_service' => ['required', 'string'],
            'payment_method' => ['nullable', 'string'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'address_id.required' => 'Silakan pilih alamat pengiriman.',
            'address_id.integer' => 'ID alamat pengiriman tidak valid.',
            'address_id.exists' => 'Alamat pengiriman tidak valid atau bukan milik Anda.',
            'stores.required' => 'Tidak ada toko yang dipilih untuk checkout.',
            'stores.array' => 'Format data toko tidak valid.',
            'stores.min' => 'Minimal satu toko harus dipilih.',
            'stores.*.store_id.required' => 'ID toko tidak boleh kosong.',
            'stores.*.store_id.exists' => 'Toko tidak ditemukan.',
            'stores.*.courier_name.required' => 'Silakan pilih kurir untuk setiap toko.',
            'stores.*.courier_name.in' => 'Kurir tidak valid. Pilih dari: jne, sicepat, gosend, jnt.',
            'stores.*.courier_service.required' => 'Silakan pilih layanan kurir.',
        ];
    }
}
