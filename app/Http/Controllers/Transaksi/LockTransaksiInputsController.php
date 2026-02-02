<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaksi\LockTransaksiInputsRequest;
use App\Models\Transaksi\LockTransaksiInputs;
use App\Models\Transaksi\TransaksiInputs;
use Illuminate\Http\RedirectResponse;

class LockTransaksiInputsController extends Controller
{
    public function update(LockTransaksiInputsRequest $request, int $year, int $month): RedirectResponse
    {
        // Merge route parameters into request for validation
        $request->merge([
            'year' => $year,
            'month' => $month,
        ]);

        $validated = $request->validated();

        $lock = LockTransaksiInputs::firstOrCreate(
            ['year' => $year, 'month' => $month],
            ['is_locked' => false]
        );

        $lock->is_locked = $validated['is_locked'] ?? ! $lock->is_locked;
        $lock->save();

        // Batch update transaksi_inputs.is_locked
        TransaksiInputs::where('year', $year)
            ->where('month', $month)
            ->update(['is_locked' => $lock->is_locked]);

        $message = $lock->is_locked
            ? 'Periode berhasil dikunci'
            : 'Periode berhasil dibuka';

        return redirect()->back()->with('success', $message);
    }
}
