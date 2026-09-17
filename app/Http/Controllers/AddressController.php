<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'receiver' => 'required|string|max:150',
            'phone' => 'required|string|max:25',
            'full_address' => 'required|string|max:1000',
            'note' => 'nullable|string|max:255',
            'pinpoint' => 'nullable|string|max:255',
            'is_main' => 'nullable|boolean',
        ]);

        /** @var User $user */
        $user = Auth::user();

        $isFirstAddress = $user->addresses()->count() === 0;
        $isMain = $isFirstAddress || ! empty($validated['is_main']);

        if ($isMain) {
            $user->addresses()->update(['is_main' => false]);
        }

        $user->addresses()->create([
            'label' => $validated['label'],
            'receiver' => $validated['receiver'],
            'phone' => $validated['phone'],
            'full_address' => $validated['full_address'],
            'note' => $validated['note'] ?? null,
            'pinpoint' => $validated['pinpoint'] ?? 'Plered, West Java, Indonesia',
            'is_main' => $isMain,
        ]);

        return back()->with('status', 'Alamat berhasil ditambahkan!');
    }

    public function update(Request $request, Address $address): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($address->user_id !== $user->id) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'receiver' => 'required|string|max:150',
            'phone' => 'required|string|max:25',
            'full_address' => 'required|string|max:1000',
            'note' => 'nullable|string|max:255',
            'pinpoint' => 'nullable|string|max:255',
            'is_main' => 'nullable|boolean',
        ]);

        $isMain = ! empty($validated['is_main']);

        if ($isMain) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_main' => false]);
        }

        $address->update([
            'label' => $validated['label'],
            'receiver' => $validated['receiver'],
            'phone' => $validated['phone'],
            'full_address' => $validated['full_address'],
            'note' => $validated['note'] ?? null,
            'pinpoint' => $validated['pinpoint'] ?? $address->pinpoint,
            'is_main' => $isMain ? true : $address->is_main,
        ]);

        return back()->with('status', 'Alamat berhasil diperbarui!');
    }

    public function destroy(Address $address): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($address->user_id !== $user->id) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $wasMain = $address->is_main;
        $address->delete();

        if ($wasMain) {
            $user->addresses()->first()?->update(['is_main' => true]);
        }

        return back()->with('status', 'Alamat berhasil dihapus!');
    }

    public function setMain(Address $address): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($address->user_id !== $user->id) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $user->addresses()->where('id', '!=', $address->id)->update(['is_main' => false]);
        $address->update(['is_main' => true]);

        return back()->with('status', 'Alamat utama berhasil diubah!');
    }
}
