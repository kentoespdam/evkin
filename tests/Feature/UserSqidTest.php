<?php

use App\Models\User;

it('user has sqid attribute with correct prefix', function () {
    $user = User::factory()->create();

    expect($user->sqid)
        ->toBeString()
        ->toStartWith('usr_');
});

it('can find user by sqid', function () {
    $user = User::factory()->create();
    $sqid = $user->sqid;

    $foundUser = User::findBySqid($sqid);

    expect($foundUser)
        ->toBeInstanceOf(User::class)
        ->id->toBe($user->id);
});

it('can find user by sqid or fail', function () {
    $user = User::factory()->create();
    $sqid = $user->sqid;

    $foundUser = User::findBySqidOrFail($sqid);

    expect($foundUser)
        ->toBeInstanceOf(User::class)
        ->id->toBe($user->id);
});

it('throws exception when sqid not found', function () {
    User::findBySqidOrFail('usr_invalid123');
})->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

it('can query users using whereSqid', function () {
    $user = User::factory()->create();
    $sqid = $user->sqid;

    $foundUser = User::query()
        ->whereSqid($sqid)
        ->first();

    expect($foundUser)
        ->toBeInstanceOf(User::class)
        ->id->toBe($user->id);
});

