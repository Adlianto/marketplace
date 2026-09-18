<?php

namespace App\Actions\Review;

use App\Models\ProductReview;
use App\Models\SubOrderItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;

class CreateVerifiedReviewAction
{
    /**
     * @param  array{
     *   sub_order_item_id: int,
     *   rating: int,
     *   review: string,
     *   photos?: array<int, UploadedFile>|null
     * }  $data
     */
    public function execute(User $user, array $data): ProductReview
    {
        /** @var SubOrderItem $item */
        $item = SubOrderItem::findOrFail($data['sub_order_item_id']);

        $photoPaths = [];
        if (! empty($data['photos']) && is_array($data['photos'])) {
            foreach ($data['photos'] as $photo) {
                if ($photo instanceof UploadedFile) {
                    $path = $photo->store('reviews', 'public');
                    $photoPaths[] = '/storage/'.$path;
                }
            }
        }

        $avatarUrl = $user->avatar
            ? (str_starts_with($user->avatar, 'http') ? $user->avatar : '/storage/'.$user->avatar)
            : 'https://api.dicebear.com/7.x/notionists/svg?seed='.urlencode($user->name);

        return ProductReview::create([
            'product_id' => $item->product_id,
            'user_id' => $user->id,
            'sub_order_item_id' => $item->id,
            'user_name' => $user->name,
            'user_avatar' => $avatarUrl,
            'rating' => $data['rating'],
            'review' => $data['review'],
            'comment' => $data['review'],
            'photos' => ! empty($photoPaths) ? $photoPaths : null,
        ]);
    }
}
