<?php

namespace App\Http\Requests\Dispute;

use App\Models\DisputeTicket;
use App\Models\SubOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class OpenDisputeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        $subOrderId = $this->input('sub_order_id');
        if (! $subOrderId) {
            return false;
        }

        /** @var SubOrder|null $subOrder */
        $subOrder = SubOrder::find($subOrderId);
        if (! $subOrder) {
            return false;
        }

        // 1. Pastikan sub_order dimiliki oleh auth user
        if ($subOrder->user_id !== $user->id) {
            return false;
        }

        // 2. Pastikan status adalah 'delivered' atau 'shipped'
        $status = is_object($subOrder->status) ? $subOrder->status->value : (string) $subOrder->status;
        if (! in_array($status, ['delivered', 'shipped'], true)) {
            return false;
        }

        // 3. Pastikan belum ada tiket komplain aktif untuk sub_order ini
        $hasActiveDispute = DisputeTicket::where('sub_order_id', $subOrderId)->exists();
        if ($hasActiveDispute) {
            return false;
        }

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
            'sub_order_id' => ['required', 'integer', 'exists:sub_orders,id', 'unique:dispute_tickets,sub_order_id'],
            'reason' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:15', 'max:2000'],
            'photos' => ['required', 'array', 'min:1', 'max:5'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'sub_order_id.required' => 'ID pesanan wajib diisi.',
            'sub_order_id.exists' => 'Pesanan tidak ditemukan.',
            'sub_order_id.unique' => 'Komplain untuk pesanan ini sudah pernah diajukan.',
            'reason.required' => 'Alasan komplain wajib dipilih atau diisi.',
            'reason.max' => 'Alasan komplain maksimal 255 karakter.',
            'description.required' => 'Deskripsi keluhan wajib diisi.',
            'description.min' => 'Deskripsi keluhan minimal 15 karakter.',
            'description.max' => 'Deskripsi keluhan maksimal 2000 karakter.',
            'photos.required' => 'Wajib melampirkan minimal 1 foto bukti.',
            'photos.min' => 'Wajib melampirkan minimal 1 foto bukti.',
            'photos.max' => 'Maksimal 5 foto bukti yang dapat dilampirkan.',
            'photos.*.image' => 'File bukti harus berupa gambar.',
            'photos.*.mimes' => 'Format gambar harus berupa JPG, JPEG, PNG, atau WEBP.',
            'photos.*.max' => 'Ukuran maksimal per foto bukti adalah 2MB.',
        ];
    }
}
