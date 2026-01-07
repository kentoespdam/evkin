<?php

use App\Http\Controllers\Transaksi\TransasksiInputsController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect("transaksi", "/dashboard");

    Route::group(["prefix" => "transaksi"], function () {
        Route::group(["prefix" => "inputs"], function () {
            Route::get("", [TransasksiInputsController::class, "index"])->name("transaksi.inputs");
            Route::get("add", [TransasksiInputsController::class, "add"])->name("transaksi.inputs.add");
            Route::post("", [TransasksiInputsController::class, "store"])->name("transaksi.inputs.store");
            Route::get("test", [TransasksiInputsController::class, "TransTest"])->name("transaksi.inputs.test");
        });
    });
});