<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaksi\TransaksiInputsRequest;
use App\Http\Resources\RoleInputsCollection;
use App\Http\Resources\TransaksiInputsCollection;
use App\Jobs\HitungJob;
use App\Models\Master\RoleInputs;
use App\Models\Transaksi\TransaksiInputs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransasksiInputsController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->year ?? date('Y');
        $month = $request->month ?? date('m');
        $query = TransaksiInputs::with('masterInput')
            ->where('year', $year)
            ->where('month', $month);

        $query_page = RoleInputs::with('masterInput')
            ->where('role_id', $request->user()->role_id);
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('masterInput', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%");
            });
            $query_page->whereHas('masterInput', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%");
            });
        }

        $page = $query_page->get()->all();
        $data = $query->whereIn('master_input_id', collect($page)->pluck('master_input_id'))->get();

        return Inertia::render('transaksi/inputs/index', [
            'page' => new RoleInputsCollection($page),
            'data' => new TransaksiInputsCollection($data ?? []),
            'filters' => [
                'year' => $year,
                'month' => (string) ($month + 0),
                'search' => $request->search ?? '',
            ],
        ]);
    }

    public function store(TransaksiInputsRequest $request)
    {
        $data = $request->validated();
        $arrData = [];
        for ($i = 0; $i < count($data['master_input_ids']); $i++) {
            $new_data = [
                'periode' => sprintf('%04d-%02d-01', $data['year'], $data['month']),
                'year' => $data['year'],
                'month' => $data['month'],
                'master_input_id' => $data['master_input_ids'][$i],
                'nilai' => $data['nilais'][$i],
            ];
            $arrData[] = $new_data;
        }

        TransaksiInputs::upsert(
            $arrData,
            ['master_input_id', 'year', 'month'],
            ['periode', 'nilai']
        );

        HitungJob::dispatch($data['year'], $data['month']);

        return redirect()->route('transaksi.inputs', [
            'year' => $data['year'],
            'month' => $data['month'],
        ])
            ->with('success', 'Transaksi Input saved sucessfully');
    }
}
