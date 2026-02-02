<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaksi\TransaksiInputsRequest;
use App\Http\Resources\LockTransaksiInputsCollection;
use App\Http\Resources\RoleInputsCollection;
use App\Http\Resources\TransaksiInputsCollection;
use App\Jobs\HitungJob;
use App\Models\Master\RoleInputs;
use App\Models\Transaksi\LockTransaksiInputs;
use App\Models\Transaksi\TransaksiInputs;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiInputsController extends Controller
{
    public function index(Request $request): Response
    {
        $year = $request->integer('year', (int) date('Y'));
        $month = $request->integer('month', (int) date('m'));
        $search = $request->string('search')->trim()->value();

        $roleInputsQuery = RoleInputs::query()
            ->with('masterInput')
            ->where('role_id', $request->user()->role_id);

        if ($search) {
            $roleInputsQuery->whereHas(
                'masterInput',
                fn ($query) => $query->where('name', 'like', "%{$search}%")
            );
        }

        $roleInputs = $roleInputsQuery->get();
        $masterInputIds = $roleInputs->pluck('master_input_id');

        $transaksiInputsQuery = TransaksiInputs::query()
            ->with('masterInput')
            ->where('year', $year)
            ->where('month', $month)
            ->whereIn('master_input_id', $masterInputIds);

        if ($search) {
            $transaksiInputsQuery->whereHas(
                'masterInput',
                fn ($query) => $query->where('name', 'like', "%{$search}%")
            );
        }

        $transaksiInputs = $transaksiInputsQuery->get();

        $locks = LockTransaksiInputs::where('year', $year)->get();

        return Inertia::render('transaksi/inputs/index', [
            'page' => new RoleInputsCollection($roleInputs),
            'data' => new TransaksiInputsCollection($transaksiInputs),
            'locks' => new LockTransaksiInputsCollection($locks),
            'filters' => [
                'year' => $year,
                'month' => (string) $month,
                'search' => $search,
            ],
        ]);
    }

    public function store(TransaksiInputsRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Check if period is locked
        $lock = LockTransaksiInputs::where('year', $validated['year'])
            ->where('month', $validated['month'])
            ->where('is_locked', true)
            ->first();

        if ($lock) {
            return redirect()->back()->with('error', 'Periode sudah dikunci, tidak dapat mengubah data');
        }

        $transaksiData = $this->prepareTransaksiData(
            $validated['year'],
            $validated['month'],
            $validated['master_input_ids'],
            $validated['nilais']
        );

        TransaksiInputs::upsert(
            $transaksiData,
            ['master_input_id', 'year', 'month'],
            ['periode', 'nilai']
        );

        HitungJob::dispatch($validated['year'], $validated['month']);

        return redirect()->route('transaksi.inputs', [
            'year' => $validated['year'],
            'month' => $validated['month'],
        ])->with('success', 'Transaksi Input saved successfully');
    }

    private function prepareTransaksiData(int $year, int $month, array $masterInputIds, array $nilais): array
    {
        $periode = sprintf('%04d-%02d-01', $year, $month);

        return array_map(
            fn ($masterInputId, $nilai) => [
                'periode' => $periode,
                'year' => $year,
                'month' => $month,
                'master_input_id' => $masterInputId,
                'nilai' => $nilai,
            ],
            $masterInputIds,
            $nilais
        );
    }
}
