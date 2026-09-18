<?php

namespace App\Http\Controllers;

use App\Actions\Review\CreateVerifiedReviewAction;
use App\Http\Requests\Review\StoreVerifiedReviewRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class ProductReviewController extends Controller
{
    /**
     * Handle store verified product review request.
     */
    public function store(
        StoreVerifiedReviewRequest $request,
        CreateVerifiedReviewAction $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $action->execute($user, $request->validated());

        return back()->with('success', 'Ulasan Anda berhasil dikirim! Terima kasih atas ulasan yang Anda berikan.');
    }
}
