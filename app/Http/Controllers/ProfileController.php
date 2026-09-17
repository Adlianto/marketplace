<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'birthday' => 'nullable|date',
            'gender' => 'nullable|string|in:Pria,Wanita',
        ]);

        $user->update(array_filter($validated, fn($val) => !is_null($val)));

        return back()->with('status', 'Profil berhasil diperbarui!');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|file|max:10240',
        ]);

        $user = Auth::user();

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar'); 
            if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
            }
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $extension;
            $path = $file->storeAs('avatars', $filename, 'public');

            $user->update(['avatar' => '/storage/' . $path]);
        }

        return back()->with('status', 'Foto profil berhasil diperbarui!');
    }

    public function setPassword(Request $request)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('status', 'Kata sandi berhasil dibuat!');
    }

    public function setPin(Request $request)
    {
        $request->validate([
            'pin' => ['required', 'digits:6', 'confirmed'],
        ]);

        $request->user()->update([
            'pin' => Hash::make($request->pin),
        ]);

        return back()->with('status', 'PIN transaksi berhasil disimpan!');
    }
}