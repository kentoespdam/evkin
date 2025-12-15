<?php

use App\Http\Controllers\Master\MasterInputController;
use App\Http\Controllers\Master\MasterSourceController;
use App\Http\Controllers\Master\RoleInputController;
use App\Http\Controllers\Master\RolesController;
use App\Http\Controllers\Master\UsersController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:'.config('master.allowed_roles')])->group(function () {
    Route::redirect('master', '/dashboard');
    Route::group(['prefix' => 'master'], function () {
        Route::group(['prefix' => 'users'], function () {
            Route::get('', [UsersController::class, 'index'])->name('master.users');
            Route::get('add', [UsersController::class, 'add'])->name('master.users.add');
            Route::post('', [UsersController::class, 'store'])->name('master.users.store');
            Route::get('{user}/edit', [UsersController::class, 'edit'])->name('master.users.edit');
            Route::patch('{user}', [UsersController::class, 'update'])->name('master.users.update');
            Route::delete('{user}', [UsersController::class, 'destroy'])->name('master.users.destroy');
        });
        Route::group(['prefix' => 'roles'], function () {
            Route::get('', [RolesController::class, 'index'])->name('master.roles');
            Route::get('add', [RolesController::class, 'add'])->name('master.roles.add');
            Route::post('', [RolesController::class, 'store'])->name('master.roles.store');
            Route::get('{role}/edit', [RolesController::class, 'edit'])->name('master.roles.edit');
            Route::patch('{role}', [RolesController::class, 'update'])->name('master.roles.update');
            Route::delete('{role}', [RolesController::class, 'destroy'])->name('master.roles.destroy');
        });
        Route::group(['prefix' => 'sources'], function () {
            Route::get('', [MasterSourceController::class, 'index'])->name('master.sources');
            Route::get('add', [MasterSourceController::class, 'add'])->name('master.sources.add');
            Route::post('', [MasterSourceController::class, 'store'])->name('master.sources.store');
            Route::get('{source}/edit', [MasterSourceController::class, 'edit'])->name('master.sources.edit');
            Route::patch('{source}', [MasterSourceController::class, 'update'])->name('master.sources.update');
            Route::delete('{source}', [MasterSourceController::class, 'destroy'])->name('master.sources.destroy');
        });
        Route::group(['prefix' => 'inputs'], function () {
            Route::get('', [MasterInputController::class, 'index'])->name('master.inputs');
            Route::get('add', [MasterInputController::class, 'add'])->name('master.inputs.add');
            Route::post('', [MasterInputController::class, 'store'])->name('master.inputs.store');
            Route::get('{input}/edit', [MasterInputController::class, 'edit'])->name('master.inputs.edit');
            Route::patch('{input}', [MasterInputController::class, 'update'])->name('master.inputs.update');
            Route::delete('{input}', [MasterInputController::class, 'destroy'])->name('master.inputs.destroy');
        });
        Route::group(['prefix' => 'role-inputs'], function () {
            Route::get('', [RoleInputController::class, 'index'])->name('master.role-inputs');
            Route::get('add', [RoleInputController::class, 'add'])->name('master.role-inputs.add');
            Route::post('', [RoleInputController::class, 'store'])->name('master.role-inputs.store');
            Route::get('{role}/edit', [RoleInputController::class, 'edit'])->name('master.role-inputs.edit');
            Route::patch('{role}', [RoleInputController::class, 'update'])->name('master.role-inputs.update');
            Route::delete('{roleInput}', [RoleInputController::class, 'destroy'])->name('master.role-inputs.destroy');
        });
    });
});
