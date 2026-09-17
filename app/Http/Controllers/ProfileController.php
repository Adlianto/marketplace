<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'birthday' => 'nullable|date',
            'gender' => 'nullable|string|in:Pria,Wanita',
        ]);

        $user->update(array_filter($validated, fn ($val) => ! is_null($val)));

        return back()->with('status', 'Profil berhasil diperbarui!');
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => 'required|file|max:10240',
        ]);

        /** @var User $user */
        $user = Auth::user();

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
            }
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = 'avatar_'.$user->id.'_'.time().'.'.$extension;
            $path = $file->storeAs('avatars', $filename, 'public');

            $user->update(['avatar' => '/storage/'.$path]);
        }

        return back()->with('status', 'Foto profil berhasil diperbarui!');
    }

    public function setPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        /** @var User $user */
        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('status', 'Kata sandi berhasil dibuat!');
    }

    public function setPin(Request $request): RedirectResponse
    {
        $request->validate([
            'pin' => ['required', 'digits:6', 'confirmed'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $user->update([
            'pin' => Hash::make($request->pin),
        ]);

        return back()->with('status', 'PIN transaksi berhasil disimpan!');
    }
}
