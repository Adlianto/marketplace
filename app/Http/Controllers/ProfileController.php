<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
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
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|lowercase|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'birthday' => 'nullable|date',
            'gender' => 'nullable|string|in:Pria,Wanita',
        ]);

        if ($request->has('email') && $user->email !== $validated['email']) {
            $user->email_verified_at = null;
        }

        $user->fill(array_filter($validated, fn ($val) => ! is_null($val)));
        $user->save();

        return back()->with('status', 'Profil berhasil diperbarui!');
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        /** @var User $user */
        $user = Auth::user();

        if ($request->hasFile('avatar')) {
            /** @var UploadedFile $file */
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
            'password' => Hash::make((string) $request->password),
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
            'pin' => Hash::make((string) $request->pin),
        ]);

        return back()->with('status', 'PIN transaksi berhasil disimpan!');
    }
}
