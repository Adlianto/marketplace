<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('user can upload valid avatar image', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('avatar.png', 300, 300)->size(1024);

    $response = $this->actingAs($user)->post(route('profile.avatar'), [
        'avatar' => $file,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('status', 'Foto profil berhasil diperbarui!');
    $user->refresh();
    expect($user->avatar)->not->toBeNull();
    expect($user->avatar)->toStartWith('/storage/avatars/');
});

test('avatar upload fails when file is not a valid image (SEC-07)', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    // Fake executable file disguised as jpg
    $fakeFile = UploadedFile::fake()->create('exploit.jpg', 500, 'application/x-msdownload');

    $response = $this->actingAs($user)->post(route('profile.avatar'), [
        'avatar' => $fakeFile,
    ]);

    $response->assertSessionHasErrors('avatar');
});

test('avatar upload fails when file exceeds 5120KB limit (SEC-07)', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $oversizedFile = UploadedFile::fake()->image('huge.jpg')->size(6000);

    $response = $this->actingAs($user)->post(route('profile.avatar'), [
        'avatar' => $oversizedFile,
    ]);

    $response->assertSessionHasErrors('avatar');
});
