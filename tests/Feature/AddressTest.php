<?php

use App\Models\Address;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createAddress(User $user, array $attributes = []): Address
{
    return $user->addresses()->create(array_merge([
        'label' => 'Rumah',
        'receiver' => 'Budi Santoso',
        'phone' => '08123456789',
        'full_address' => 'Jl. Jend. Sudirman No. 123, Jakarta',
        'note' => 'Pagar hitam',
        'pinpoint' => 'Jakarta, Indonesia',
        'is_main' => false,
    ], $attributes));
}

// 1. User dapat melihat daftar alamat miliknya
test('user can view list of their addresses', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $userAddress1 = createAddress($user, ['label' => 'Rumah']);
    $userAddress2 = createAddress($user, ['label' => 'Kantor']);
    createAddress($otherUser, ['label' => 'Rumah Orang Lain']);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('addresses', 2)
        ->where('addresses.0.id', fn ($id) => in_array($id, [$userAddress1->id, $userAddress2->id]))
        ->where('addresses.1.id', fn ($id) => in_array($id, [$userAddress1->id, $userAddress2->id]))
    );
});

// 2. User dapat membuat alamat baru (validasi input + simpan ke DB)
test('user can create a new address with valid data', function () {
    $user = User::factory()->create();

    $payload = [
        'label' => 'Apartemen',
        'receiver' => 'Siti Rahma',
        'phone' => '08987654321',
        'full_address' => 'Tower A Lt. 15 No. 3, Jakarta Barat',
        'note' => 'Titip di lobby',
        'pinpoint' => 'Jakarta Barat, Indonesia',
        'is_main' => true,
    ];

    $response = $this->actingAs($user)->post(route('addresses.store'), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertSessionHas('status', 'Alamat berhasil ditambahkan!');

    $this->assertDatabaseHas('addresses', [
        'user_id' => $user->id,
        'label' => 'Apartemen',
        'receiver' => 'Siti Rahma',
        'phone' => '08987654321',
        'full_address' => 'Tower A Lt. 15 No. 3, Jakarta Barat',
        'is_main' => true,
    ]);
});

test('first address created is automatically set as main address', function () {
    $user = User::factory()->create();

    $payload = [
        'label' => 'Rumah',
        'receiver' => 'Ahmad',
        'phone' => '08111222333',
        'full_address' => 'Jl. Merdeka No. 45',
        'is_main' => false,
    ];

    $response = $this->actingAs($user)->post(route('addresses.store'), $payload);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('addresses', [
        'user_id' => $user->id,
        'label' => 'Rumah',
        'is_main' => true,
    ]);
});

test('address creation requires mandatory fields', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('addresses.store'), []);

    $response->assertSessionHasErrors(['label', 'receiver', 'phone', 'full_address']);
    expect(Address::count())->toBe(0);
});

// 3. Logika is_main: jika alamat baru diset main, alamat lama otomatis is_main = false
test('setting a new address as main automatically demotes previous main address', function () {
    $user = User::factory()->create();

    $oldAddress = createAddress($user, [
        'label' => 'Alamat Lama',
        'is_main' => true,
    ]);

    expect($oldAddress->fresh()->is_main)->toBeTrue();

    $this->actingAs($user)->post(route('addresses.store'), [
        'label' => 'Alamat Baru',
        'receiver' => 'Jane Doe',
        'phone' => '08555444332',
        'full_address' => 'Jl. Thamrin No. 88, Jakarta Pusat',
        'is_main' => true,
    ]);

    expect($oldAddress->fresh()->is_main)->toBeFalse();

    $newAddress = $user->addresses()->where('label', 'Alamat Baru')->first();
    expect($newAddress)->not->toBeNull();
    expect($newAddress->is_main)->toBeTrue();
});

// 4. User dapat update dan delete alamat miliknya sendiri
test('user can update their own address', function () {
    $user = User::factory()->create();
    $address = createAddress($user, ['label' => 'Rumah Lama']);

    $updatePayload = [
        'label' => 'Rumah Renovasi',
        'receiver' => 'Budi Baru',
        'phone' => '08129999888',
        'full_address' => 'Jl. Kebon Jeruk No. 99, Jakarta',
        'note' => 'Cat hijau',
        'pinpoint' => 'Jakarta, Indonesia',
        'is_main' => false,
    ];

    $response = $this->actingAs($user)->patch(route('addresses.update', $address), $updatePayload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertSessionHas('status', 'Alamat berhasil diperbarui!');

    $this->assertDatabaseHas('addresses', [
        'id' => $address->id,
        'user_id' => $user->id,
        'label' => 'Rumah Renovasi',
        'receiver' => 'Budi Baru',
        'phone' => '08129999888',
    ]);
});

test('user can delete their own address', function () {
    $user = User::factory()->create();
    $address = createAddress($user, ['is_main' => false]);

    $response = $this->actingAs($user)->delete(route('addresses.destroy', $address));

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertSessionHas('status', 'Alamat berhasil dihapus!');

    $this->assertDatabaseMissing('addresses', ['id' => $address->id]);
});

test('deleting main address promotes remaining address to main', function () {
    $user = User::factory()->create();
    $mainAddress = createAddress($user, ['label' => 'Main', 'is_main' => true]);
    $backupAddress = createAddress($user, ['label' => 'Backup', 'is_main' => false]);

    $response = $this->actingAs($user)->delete(route('addresses.destroy', $mainAddress));

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseMissing('addresses', ['id' => $mainAddress->id]);
    expect($backupAddress->fresh()->is_main)->toBeTrue();
});

test('user can set an address as main', function () {
    $user = User::factory()->create();
    $address1 = createAddress($user, ['label' => 'Pertama', 'is_main' => true]);
    $address2 = createAddress($user, ['label' => 'Kedua', 'is_main' => false]);

    $response = $this->actingAs($user)->patch(route('addresses.setMain', $address2));

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertSessionHas('status', 'Alamat utama berhasil diubah!');

    expect($address1->fresh()->is_main)->toBeFalse();
    expect($address2->fresh()->is_main)->toBeTrue();
});

// 5. User dilarang mengedit atau menghapus alamat milik user lain (403/Forbidden)
test('user cannot update another users address', function () {
    $owner = User::factory()->create();
    $attacker = User::factory()->create();
    $address = createAddress($owner, ['label' => 'Alamat Pemilik']);

    $response = $this->actingAs($attacker)->patch(route('addresses.update', $address), [
        'label' => 'Alamat Dihack',
        'receiver' => 'Hacker',
        'phone' => '0800000000',
        'full_address' => 'Jl. Gelap Gulita No. 0',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseHas('addresses', [
        'id' => $address->id,
        'label' => 'Alamat Pemilik',
    ]);
});

test('user cannot delete another users address', function () {
    $owner = User::factory()->create();
    $attacker = User::factory()->create();
    $address = createAddress($owner);

    $response = $this->actingAs($attacker)->delete(route('addresses.destroy', $address));

    $response->assertForbidden();
    $this->assertDatabaseHas('addresses', ['id' => $address->id]);
});

test('user cannot set main on another users address', function () {
    $owner = User::factory()->create();
    $attacker = User::factory()->create();
    $address = createAddress($owner, ['is_main' => false]);

    $response = $this->actingAs($attacker)->patch(route('addresses.setMain', $address));

    $response->assertForbidden();
    expect($address->fresh()->is_main)->toBeFalse();
});
