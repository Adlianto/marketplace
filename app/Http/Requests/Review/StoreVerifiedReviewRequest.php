<?php

namespace App\Http\Requests\Review;

use App\Enums\SubOrderStatus;
use App\Models\ProductReview;
use App\Models\SubOrderItem;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVerifiedReviewRequest extends FormRequest
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

        $subOrderItemId = $this->input('sub_order_item_id');
        if (! $subOrderItemId) {
            return false;
        }

        /** @var SubOrderItem|null $item */
        $item = SubOrderItem::with('subOrder')->find($subOrderItemId);
        if (! $item || ! $item->subOrder) {
            return false;
        }

        // 1. Pastikan item dimiliki user login via subOrder.user_id === auth()->id()
        if ($item->subOrder->user_id !== $user->id) {
            return false;
        }

        // 2. Pastikan subOrder memiliki status = 'completed'
        $status = $item->subOrder->status;
        $isCompleted = ($status instanceof SubOrderStatus)
            ? $status === SubOrderStatus::Completed
            : $status === 'completed';

        if (! $isCompleted) {
            return false;
        }

        // 3. Pastikan belum pernah ada ulasan untuk sub_order_item_id ini
        $alreadyReviewed = ProductReview::where('sub_order_item_id', $subOrderItemId)->exists();
        if ($alreadyReviewed) {
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
            'sub_order_item_id' => ['required', 'integer', 'exists:sub_order_items,id', 'unique:product_reviews,sub_order_item_id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['required', 'string', 'min:10', 'max:1000'],
            'photos' => ['nullable', 'array', 'max:3'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'sub_order_item_id.required' => 'ID item pesanan wajib diisi.',
            'sub_order_item_id.exists' => 'Item pesanan tidak ditemukan.',
            'sub_order_item_id.unique' => 'Anda sudah memberikan ulasan untuk item ini.',
            'rating.required' => 'Rating bintang wajib dipilih.',
            'rating.min' => 'Rating minimal 1 bintang.',
            'rating.max' => 'Rating maksimal 5 bintang.',
            'review.required' => 'Ulasan wajib diisi.',
            'review.min' => 'Ulasan minimal 10 karakter.',
            'review.max' => 'Ulasan maksimal 1000 karakter.',
            'photos.max' => 'Maksimal 3 foto yang dapat diunggah.',
            'photos.*.image' => 'File harus berupa gambar.',
            'photos.*.mimes' => 'Format gambar harus berupa JPG, JPEG, PNG, atau WEBP.',
            'photos.*.max' => 'Ukuran maksimal per gambar adalah 2MB.',
        ];
    }
}
