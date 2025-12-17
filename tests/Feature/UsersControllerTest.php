<?php

use App\Models\User;

it('displays users index with sqid as id', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->get(route('master.users'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('master/users')
        ->has('page.data')
    );
});

it('resolves user by sqid via route model binding for show', function () {
    $user = User::factory()->create();
    $sqid = $user->sqid;

    $this->actingAs($user);

    // Test that route model binding works (resolves sqid to User)
    $response = $this->get("/master/users/{$sqid}");

    // Route resolves correctly (not 404)
    $response->assertOk();
});

it('resolves user by sqid via route model binding for edit', function () {
    $user = User::factory()->create();
    $sqid = $user->sqid;

    $this->actingAs($user);

    // Test that route model binding works (resolves sqid to User)
    $response = $this->get("/master/users/{$sqid}/edit");

    // Route resolves correctly (not 404)
    $response->assertOk();
});

it('can delete user with DELETE confirmation', function () {
    $admin = User::factory()->create();
    $userToDelete = User::factory()->create();
    $sqid = $userToDelete->sqid;
    $rawId = $userToDelete->getAttributes()['id'];

    $this->actingAs($admin);

    $response = $this->delete(route('master.users.destroy', $sqid), [
        'password' => 'DELETE',
    ]);

    $response->assertRedirect(route('master.users'));
    $response->assertSessionHas('success', 'User deleted successfully');
    $this->assertDatabaseMissing('users', ['id' => $rawId]);
});

it('requires DELETE confirmation to delete user', function () {
    $admin = User::factory()->create();
    $userToDelete = User::factory()->create();
    $sqid = $userToDelete->sqid;
    $rawId = $userToDelete->getAttributes()['id'];

    $this->actingAs($admin);

    $response = $this->delete(route('master.users.destroy', $sqid), [
        'password' => '',
    ]);

    $response->assertSessionHasErrors(['password']);
    $this->assertDatabaseHas('users', ['id' => $rawId]);
});

it('validates DELETE is case sensitive', function (string $wrongPassword) {
    $admin = User::factory()->create();
    $userToDelete = User::factory()->create();
    $sqid = $userToDelete->sqid;
    $rawId = $userToDelete->getAttributes()['id'];

    $this->actingAs($admin);

    $response = $this->delete(route('master.users.destroy', $sqid), [
        'password' => $wrongPassword,
    ]);

    $response->assertSessionHasErrors(['password']);
    $this->assertDatabaseHas('users', ['id' => $rawId]);
})->with([
    'lowercase' => 'delete',
    'mixed case' => 'Delete',
    'other text' => 'yes',
]);

it('returns 404 for invalid sqid', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->get(route('master.users.show', 'usr_invalid123'));

    $response->assertNotFound();
});
