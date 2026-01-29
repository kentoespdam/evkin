<?php

use App\Http\Controllers\Report\PerhitunganReportsController;
use App\Http\Controllers\Report\RekapInputTahunansController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('report', '/dashboard');

    Route::group(['prefix' => 'report'], function () {
        Route::group(['prefix' => 'perhitungan-reports'], function () {
            Route::get('', [PerhitunganReportsController::class, 'index'])->name('report.perhitungan-reports');
            Route::get('detail', [PerhitunganReportsController::class, 'detail'])->name('report.perhitungan-reports.detail');
        });
        Route::get('rekap-tahunan', [RekapInputTahunansController::class, 'index'])->name('report.rekap-tahunan');
    });
});
