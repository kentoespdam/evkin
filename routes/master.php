<?php

use App\Http\Controllers\Master\RolesController;
use App\Http\Controllers\Master\UsersController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('master', '/dashboard');
    Route::group(['prefix' => 'master'], function () {
        Route::group(['prefix' => 'users'], function () {
            Route::get('', [UsersController::class, 'index'])->name('master.users');
            Route::get('add', [UsersController::class, 'add'])->name('master.users.add');
            Route::post('', [UsersController::class, 'store'])->name('master.users.store');
            Route::get('{user}', [UsersController::class, 'show'])->name('master.users.show');
            Route::get('{user}/edit', [UsersController::class, 'edit'])->name('master.users.edit');
            Route::patch('{user}', [UsersController::class, 'update'])->name('master.users.update');
            Route::delete('{user}', [UsersController::class, 'destroy'])->name('master.users.destroy');
        });
        Route::group(['prefix' => 'roles'], function () {
            Route::get('', [RolesController::class, 'index'])->name('master.roles');
            Route::get('add', [RolesController::class, 'add'])->name('master.roles.add');
            Route::post('', [RolesController::class, 'store'])->name('master.roles.store');
            Route::get('{role}', [RolesController::class, 'show'])->name('master.roles.show');
            Route::get('{role}/edit', [RolesController::class, 'edit'])->name('master.roles.edit');
            Route::patch('{role}', [RolesController::class, 'update'])->name('master.roles.update');
            Route::delete('{role}', [RolesController::class, 'destroy'])->name('master.roles.destroy');
        });
    });
});
