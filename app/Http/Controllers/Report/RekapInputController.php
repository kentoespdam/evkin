<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Http\Resources\AspectsCollection;
use App\Http\Resources\LockTransaksiInputsCollection;
use App\Http\Resources\MasterInputsCollection;
use App\Http\Resources\RekapInputTahunansCollection;
use App\Http\Resources\ReportTypesCollection;
use App\Http\Resources\TransaksiInputsCollection;
use App\Models\Master\MasterInputs;
use App\Models\Transaksi\LockTransaksiInputs;
use App\Models\Transaksi\RekapInputTahunans;
use App\Models\Transaksi\TransaksiInputs;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class RekapInputController extends Controller
{
    private const DEFAULT_PER_PAGE = 10;

    private const REKAP_RELATIONS = ['masterInput.masterSource', 'masterInput.aspect.reportType'];

    public function rekapBulanan(Request $request): Response
    {
        $year = $request->integer('year', (int) date('Y'));
        $perPage = $request->integer('per_page', self::DEFAULT_PER_PAGE);

        $page = MasterInputs::where('aspect_id', '!=', null)
            ->when($request->filled('search'), fn($query) => $query->where('description', 'like', '%' . $request->search . '%'))
            ->orderBy('aspect_id')
            ->orderBy('seq')
            ->paginate($perPage);

        [$masterIds, $aspects, $reportTypes] = $this->extractAspectsAndReportTypes($page);

        $rekapData = TransaksiInputs::with(self::REKAP_RELATIONS)
            ->whereIn('master_input_id', $masterIds)
            ->where('year', $year)
            ->get()
            ->sortBy(fn($item) => $item->masterInput->seq)
            ->values();

        $rekapTahunan = RekapInputTahunans::with(self::REKAP_RELATIONS)
            ->whereIn('master_input_id', $masterIds)
            ->where('year', $year - 1)
            ->orderBy('seq')
            ->get();
        $lockTransaksiInputs = LockTransaksiInputs::where('year', $year)->get();

        return Inertia::render('rekap/bulanan/index', [
            'page' => new MasterInputsCollection($page),
            'aspects' => $aspects,
            'reportTypes' => $reportTypes,
            'rekapData' => new TransaksiInputsCollection($rekapData),
            'rekapTahunan' => new RekapInputTahunansCollection($rekapTahunan),
            'lockTransaksiInputs' => new LockTransaksiInputsCollection($lockTransaksiInputs),
            'filters' => [
                'year' => $year,
                'search' => $request->string('search', '')->toString(),
            ],
        ]);
    }

    public function rekapTahunan(Request $request): Response
    {
        $currentYear = (int) date('Y');
        $fromYear = $request->integer('fromYear', $currentYear - 5);
        $toYear = $request->integer('toYear', $currentYear);
        $perPage = $request->integer('per_page', self::DEFAULT_PER_PAGE);

        $page = MasterInputs::where('aspect_id', '!=', null)
            ->when($request->filled('search'), fn($query) => $query->where('description', 'like', '%' . $request->search . '%'))
            ->orderBy('aspect_id')
            ->orderBy('seq')
            ->paginate($perPage);

        [$masterIds, $aspects, $reportTypes] = $this->extractAspectsAndReportTypes($page);

        $rekapData = RekapInputTahunans::with(self::REKAP_RELATIONS)
            ->whereIn('master_input_id', $masterIds)
            ->whereBetween('year', [$fromYear, $toYear])
            ->get()
            ->sortBy(fn($item) => [$item->year, $item->masterInput->seq])
            ->values();

        return Inertia::render('rekap/tahunan/index', [
            'page' => new MasterInputsCollection($page),
            'aspects' => $aspects,
            'reportTypes' => $reportTypes,
            'rekapData' => new RekapInputTahunansCollection($rekapData),
            'filters' => [
                'fromYear' => $fromYear,
                'toYear' => $toYear,
                'search' => $request->string('search', '')->toString(),
            ],
        ]);
    }

    /**
     * Extract aspects and report types from paginated data.
     *
     * @return array{
     *  0: \Illuminate\Support\Collection, 
     *  1: \Illuminate\Support\Collection, 
     *  2: \Illuminate\Support\Collection
     * }
     */
    private function extractAspectsAndReportTypes(LengthAwarePaginator $page): array
    {
        $masterIds = $page->pluck('id')->unique()->values();
        $aspects = [];
        foreach ($page->pluck('aspect')->whereNotNull()->unique() as $aspect) {
            $aspects[$aspect->id] = $aspect;
        }
        $aspects = collect($aspects)->unique();

        $reportTypes = [];
        foreach ($aspects->pluck('reportType')->whereNotNull()->unique() as $reportType) {
            $reportTypes[$reportType->id] = $reportType;
        }
        $reportTypes = collect($reportTypes)->unique();

        return [
            $masterIds,
            new AspectsCollection($aspects->values()),
            new ReportTypesCollection($reportTypes->values())
        ];
    }
}
