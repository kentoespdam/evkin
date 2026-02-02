<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Http\Resources\AspectsCollection;
use App\Http\Resources\LockTransaksiInputsCollection;
use App\Http\Resources\RekapInputTahunansCollection;
use App\Http\Resources\ReportTypesCollection;
use App\Http\Resources\TransaksiInputsCollection;
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

        $page = TransaksiInputs::with(self::REKAP_RELATIONS)
            ->join('master_inputs', 'transaksi_inputs.master_input_id', '=', 'master_inputs.id')
            ->where('transaksi_inputs.year', $year)
            ->when($request->filled('search'), fn ($query) => $query->where('master_inputs.description', 'like', '%'.$request->search.'%'))
            ->orderBy('master_inputs.aspect_id')
            ->orderBy('master_inputs.seq')
            ->select('transaksi_inputs.*')
            ->paginate($perPage);

        $rekap = RekapInputTahunans::with(self::REKAP_RELATIONS)
            ->where('year', $year)
            ->when($request->filled('search'), fn ($query) => $query->where('description', 'like', '%'.$request->search.'%'))
            ->orderBy('master_input_id')
            ->orderBy('seq')
            ->get();

        [$aspects, $reportTypes] = $this->extractAspectsAndReportTypes($page);

        $lockTransaksiInputs = LockTransaksiInputs::where('year', $year)->get();

        return Inertia::render('rekap/bulanan/index', [
            'page' => new TransaksiInputsCollection($page),
            'aspects' => $aspects,
            'reportTypes' => $reportTypes,
            'rekap' => new RekapInputTahunansCollection($rekap),
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

        $page = RekapInputTahunans::with(self::REKAP_RELATIONS)
            ->whereBetween('year', [$fromYear, $toYear])
            ->when($request->filled('search'), fn ($query) => $query->where('description', 'like', '%'.$request->search.'%'))
            ->orderBy('master_input_id')
            ->orderBy('seq')
            ->paginate($perPage);

        [$aspects, $reportTypes] = $this->extractAspectsAndReportTypes($page);

        return Inertia::render('rekap/tahunan/index', [
            'page' => new RekapInputTahunansCollection($page),
            'aspects' => $aspects,
            'reportTypes' => $reportTypes,
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
     * @return array{0: \Illuminate\Support\Collection, 1: \Illuminate\Support\Collection}
     */
    private function extractAspectsAndReportTypes(LengthAwarePaginator $page): array
    {
        $aspects = new AspectsCollection(
            $page->pluck('masterInput.aspect')->whereNotNull()->unique()
        );

        $reportTypes = new ReportTypesCollection(
            $aspects->collection->pluck('reportType')->unique()
        );

        return [$aspects->values(), $reportTypes->values()];
    }
}
