<?php

use App\Http\Controllers\Master\UsersController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('master', '/dashboard');
    Route::group(['prefix' => 'master'], function () {
        Route::get('users', [UsersController::class, 'index'])->name('master.users');
        Route::get('users/add', [UsersController::class, 'add'])->name('master.users.add');
        Route::get('users/{user}', [UsersController::class, 'show'])->name('master.users.show');
        Route::get('users/{user}/edit', [UsersController::class, 'edit'])->name('master.users.edit');
        Route::patch('users/{user}', [UsersController::class, 'update'])->name('master.users.update');
        Route::delete('users/{user}', [UsersController::class, 'destroy'])->name('master.users.destroy');
    });
});
