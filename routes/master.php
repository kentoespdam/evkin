<?php

use App\Http\Controllers\Master\AspectsController;
use App\Http\Controllers\Master\MasterInputsController;
use App\Http\Controllers\Master\MasterReportsController;
use App\Http\Controllers\Master\MasterSourcesController;
use App\Http\Controllers\Master\ReportTypesController;
use App\Http\Controllers\Master\RoleInputsController;
use App\Http\Controllers\Master\RolesController;
use App\Http\Controllers\Master\UsersController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:' . config('master.allowed_roles')])->group(function () {
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
            Route::get('', [MasterSourcesController::class, 'index'])->name('master.sources');
            Route::get('add', [MasterSourcesController::class, 'add'])->name('master.sources.add');
            Route::post('', [MasterSourcesController::class, 'store'])->name('master.sources.store');
            Route::get('{source}/edit', [MasterSourcesController::class, 'edit'])->name('master.sources.edit');
            Route::patch('{source}', [MasterSourcesController::class, 'update'])->name('master.sources.update');
            Route::delete('{source}', [MasterSourcesController::class, 'destroy'])->name('master.sources.destroy');
        });
        Route::group(['prefix' => 'inputs'], function () {
            Route::get('', [MasterInputsController::class, 'index'])->name('master.inputs');
            Route::get('add', [MasterInputsController::class, 'add'])->name('master.inputs.add');
            Route::post('', [MasterInputsController::class, 'store'])->name('master.inputs.store');
            Route::get('{input}/edit', [MasterInputsController::class, 'edit'])->name('master.inputs.edit');
            Route::patch('{input}', [MasterInputsController::class, 'update'])->name('master.inputs.update');
            Route::delete('{input}', [MasterInputsController::class, 'destroy'])->name('master.inputs.destroy');
        });
        Route::group(['prefix' => 'role-inputs'], function () {
            Route::get('', [RoleInputsController::class, 'index'])->name('master.role-inputs');
            Route::get('add', [RoleInputsController::class, 'add'])->name('master.role-inputs.add');
            Route::post('', [RoleInputsController::class, 'store'])->name('master.role-inputs.store');
            Route::get('{role}/edit', [RoleInputsController::class, 'edit'])->name('master.role-inputs.edit');
            Route::patch('{role}', [RoleInputsController::class, 'update'])->name('master.role-inputs.update');
            Route::delete('{roleInput}', [RoleInputsController::class, 'destroy'])->name('master.role-inputs.destroy');
        });
        Route::group(['prefix' => 'report-types'], function () {
            Route::get('', [ReportTypesController::class, 'index'])->name('master.report-types');
            Route::get('add', [ReportTypesController::class, 'add'])->name('master.report-types.add');
            Route::post('', [ReportTypesController::class, 'store'])->name('master.report-types.store');
            Route::get('{reportType}/edit', [ReportTypesController::class, 'edit'])->name('master.report-types.edit');
            Route::patch('{reportType}', [ReportTypesController::class, 'update'])->name('master.report-types.update');
            Route::delete('{reportType}', [ReportTypesController::class, 'destroy'])->name('master.report-types.destroy');
        });
        Route::group(['prefix' => 'aspects'], function () {
            Route::get('', [AspectsController::class, 'index'])->name('master.aspects');
            Route::get('add', [AspectsController::class, 'add'])->name('master.aspects.add');
            Route::post('', [AspectsController::class, 'store'])->name('master.aspects.store');
            Route::get('{aspect}/edit', [AspectsController::class, 'edit'])->name('master.aspects.edit');
            Route::patch('{aspect}', [AspectsController::class, 'update'])->name('master.aspects.update');
            Route::delete('{aspect}', [AspectsController::class, 'destroy'])->name('master.aspects.destroy');
        });
        Route::group(['prefix' => 'reports'], function () {
            Route::get('', [MasterReportsController::class, 'index'])->name('master.reports');
            Route::get('add', [MasterReportsController::class, 'add'])->name('master.reports.add');
            Route::post('', [MasterReportsController::class, 'store'])->name('master.reports.store');
            Route::get('{report}/edit', [MasterReportsController::class, 'edit'])->name('master.reports.edit');
            Route::patch('{report}', [MasterReportsController::class, 'update'])->name('master.reports.update');
            Route::delete('{report}', [MasterReportsController::class, 'destroy'])->name('master.reports.destroy');
        });
    });
});
