<?php

use App\Http\Controllers\Report\PerhitunganReportsController;
use App\Http\Controllers\Report\RekapInputController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('report', '/dashboard');

    Route::group(['prefix' => 'report'], function () {
        Route::group(['prefix' => 'perhitungan-reports'], function () {
            Route::get('', [PerhitunganReportsController::class, 'index'])->name('report.perhitungan-reports');
            Route::get('detail', [PerhitunganReportsController::class, 'detail'])->name('report.perhitungan-reports.detail');
            Route::post('detail/export', [PerhitunganReportsController::class, 'exportDetail'])->name('report.perhitungan-reports.detail.export');
        });
    });

    Route::group(['prefix' => 'rekap'], function () {
        Route::get('bulanan', [RekapInputController::class, 'rekapBulanan'])->name('rekap.rekap-bulanan');
        Route::get('tahunan', [RekapInputController::class, 'rekapTahunan'])->name('rekap.rekap-tahunan');
    });
});
