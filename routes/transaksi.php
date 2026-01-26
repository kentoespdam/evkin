<?php

use App\Http\Controllers\Transaksi\TransaksiInputsController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect("transaksi", "/dashboard");

    Route::group(["prefix" => "transaksi"], function () {
        Route::group(["prefix" => "inputs"], function () {
            Route::get("", [TransaksiInputsController::class, "index"])->name("transaksi.inputs");
            Route::get("add", [TransaksiInputsController::class, "add"])->name("transaksi.inputs.add");
            Route::post("", [TransaksiInputsController::class, "store"])->name("transaksi.inputs.store");
            Route::get("test", [TransaksiInputsController::class, "TransTest"])->name("transaksi.inputs.test");
        });
    });
});