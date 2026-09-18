<?php

namespace App\Http\Controllers;

use App\Actions\Store\OpenStoreAction;
use App\Http\Requests\Store\OpenStoreRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    /**
     * Show the store opening registration form.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasStore()) {
            return redirect()->route('seller.dashboard');
        }

        return Inertia::render('store/create');
    }

    /**
     * Handle the merchant onboarding submission.
     */
    public function store(OpenStoreRequest $request, OpenStoreAction $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->execute($user, $request->validated());

        return to_route('seller.dashboard')->with('success', 'Selamat! Toko Anda berhasil dibuka.');
    }
}
