<?php

use App\Models\Master\Roles;
use App\Models\User;

use function Pest\Laravel\actingAs;

test('authenticated user can access edit page', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();

    $response = actingAs($admin)->get("/master/users/{$user->sqid}/edit");

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('master/users/edit')
            ->has('user')
            ->has('roles'));
});

test('user can update their name', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create(['name' => 'Old Name']);

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => 'New Name',
        'email' => $user->email,
        'role_id' => $user->role_id,
    ]);

    $response->assertRedirect('/master/users')
        ->assertSessionHas('success', 'User updated successfully');

    expect($user->fresh()->name)->toBe('New Name');
});

test('user can update their email', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create(['email' => 'old@example.com']);

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => $user->name,
        'email' => 'new@example.com',
        'role_id' => $user->role_id,
    ]);

    $response->assertRedirect('/master/users');

    expect($user->fresh()->email)->toBe('new@example.com');
});

test('user can update their role', function () {
    $admin = User::factory()->create();
    $oldRole = Roles::factory()->create(['name' => 'user']);
    $newRole = Roles::factory()->create(['name' => 'admin']);
    $user = User::factory()->create(['role_id' => $oldRole->id]);

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => $user->name,
        'email' => $user->email,
        'role_id' => $newRole->id, // Use integer ID directly
    ]);

    $response->assertRedirect('/master/users');

    expect($user->fresh()->role_id)->toBe($newRole->id);
});

test('user can update password', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();
    $oldPassword = $user->password;

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => $user->name,
        'email' => $user->email,
        'role_id' => $user->role_id,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertRedirect('/master/users');

    expect($user->fresh()->password)->not->toBe($oldPassword);
});

test('password is not updated when empty', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();
    $oldPassword = $user->password;

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => 'Updated Name',
        'email' => $user->email,
        'role_id' => $user->role_id,
    ]);

    $response->assertRedirect('/master/users');

    expect($user->fresh()->password)->toBe($oldPassword);
});

test('validation fails when name is missing', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => '',
        'email' => $user->email,
        'role_id' => $user->role_id,
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('validation fails when email is invalid', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => $user->name,
        'email' => 'not-an-email',
        'role_id' => $user->role_id,
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('validation fails when email is already taken', function () {
    $admin = User::factory()->create();
    $user1 = User::factory()->create(['email' => 'existing@example.com']);
    $user2 = User::factory()->create();

    $response = actingAs($admin)->patch("/master/users/{$user2->sqid}", [
        'name' => $user2->name,
        'email' => 'existing@example.com',
        'role_id' => $user2->role_id,
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('validation fails when role does not exist', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => $user->name,
        'email' => $user->email,
        'role_id' => 'rol_nonexistent123',
    ]);

    $response->assertSessionHasErrors(['role_id']);
});

test('validation fails when password is too short', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => $user->name,
        'email' => $user->email,
        'role_id' => $user->role_id,
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertSessionHasErrors(['password']);
});

test('validation fails when password confirmation does not match', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => $user->name,
        'email' => $user->email,
        'role_id' => $user->role_id,
        'password' => 'newpassword123',
        'password_confirmation' => 'differentpassword',
    ]);

    $response->assertSessionHasErrors(['password']);
});

test('user can update their own email to the same email', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create(['email' => 'same@example.com']);

    $response = actingAs($admin)->patch("/master/users/{$user->sqid}", [
        'name' => 'Updated Name',
        'email' => 'same@example.com', // Same email
        'role_id' => $user->role_id,
    ]);

    $response->assertRedirect('/master/users');

    expect($user->fresh()->name)->toBe('Updated Name');
});
