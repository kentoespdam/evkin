<?php

it('can load the homepage as guest', function () {
    $response = $this->get('/');

    $response->assertSuccessful();
});

it('can load the homepage as authenticated user', function () {
    $user = \App\Models\User::factory()->create();

    $response = $this->actingAs($user)->get('/');

    $response->assertSuccessful();
});
