<?php

namespace App\Http\Requests\Seller;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ShipOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tracking_number' => ['required', 'string', 'min:5', 'max:50', 'regex:/^[A-Z0-9-]+$/i'],
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
            'tracking_number.required' => 'Nomor resi pengiriman wajib diisi.',
            'tracking_number.min' => 'Nomor resi pengiriman minimal 5 karakter.',
            'tracking_number.max' => 'Nomor resi pengiriman maksimal 50 karakter.',
            'tracking_number.regex' => 'Format nomor resi hanya boleh berisi huruf, angka, dan tanda hubung (-).',
        ];
    }
}
