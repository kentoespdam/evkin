<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Http\Resources\RekapInputTahunansCollection;
use App\Models\Transaksi\RekapInputTahunans;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RekapInputTahunansController extends Controller
{
    public function index(Request $request)
    {
        $fromYear = $request->year ?? date('Y') - 5;
        $toYear = $request->year ?? date('Y');
        $perPage = $request->per_page ?? 10;
        $query = RekapInputTahunans::with('masterSource')
            ->whereBetween('year', [$fromYear, $toYear])
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('description', 'like', '%'.$request->search.'%');
            })
            ->orderBy('seq', 'asc');
        $page = $query->paginate($perPage);

        return Inertia::render('report/rekap_tahunans/index', [
            'page' => new RekapInputTahunansCollection($page),
            'filters' => [
                'fromYear' => $fromYear,
                'toYear' => $toYear,
                'search' => $request->search ?? '',
            ],
        ]);
    }
}
