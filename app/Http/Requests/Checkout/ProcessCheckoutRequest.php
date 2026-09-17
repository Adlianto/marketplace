<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessCheckoutRequest extends FormRequest
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
                Rule::exists('addresses', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'payment_method' => ['required', 'string', 'in:qris,bca_va,mandiri_va,gopay'],
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
            'payment_method.required' => 'Silakan pilih metode pembayaran.',
            'payment_method.in' => 'Metode pembayaran tidak valid atau tidak didukung.',
            'notes.max' => 'Catatan pengiriman maksimal 500 karakter.',
        ];
    }
}
