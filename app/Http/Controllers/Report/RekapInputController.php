<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Http\Resources\AspectsCollection;
use App\Http\Resources\LockTransaksiInputsCollection;
use App\Http\Resources\MasterInputsCollection;
use App\Http\Resources\RekapInputTahunansCollection;
use App\Http\Resources\ReportTypesCollection;
use App\Http\Resources\TransaksiInputsCollection;
use App\Jobs\ExportRekapBulananJob;
use App\Jobs\ExportRekapTahunanJob;
use App\Models\Master\MasterInputs;
use App\Models\Transaksi\LockTransaksiInputs;
use App\Models\Transaksi\RekapInputTahunans;
use App\Models\Transaksi\TransaksiInputs;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    public function exportRekapBulanan(Request $request)
    {
        $exportId = Str::uuid()->toString();

        // Initialize cache with pending status
        Cache::put("export.{$exportId}", [
            'status' => 'pending',
            'progress' => 0,
            'created_at' => now(),
        ], 3600);

        $authId = (int) auth($request->user)->id();

        // Dispatch job
        ExportRekapBulananJob::dispatch($request->year, $exportId, $authId);

        Log::info('Export Index Queued', [
            'export_id' => $exportId,
            'filters' => $request->all(),
        ]);

        return response()->json([
            'export_id' => $exportId,
            'message' => 'Export is being processed',
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

    public function exportRekapTahunan(Request $request)
    {
        $exportId = Str::uuid()->toString();

        // Initialize cache with pending status
        Cache::put("export.{$exportId}", [
            'status' => 'pending',
            'progress' => 0,
            'created_at' => now(),
        ], 3600);

        $authId = (int) auth($request->user)->id();

        // Dispatch job
        ExportRekapTahunanJob::dispatch($request->fromYear, $request->toYear, $exportId, $authId);

        Log::info('Export Index Queued', [
            'export_id' => $exportId,
            'filters' => $request->all(),
        ]);

        return response()->json([
            'export_id' => $exportId,
            'message' => 'Export is being processed',
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
            new ReportTypesCollection($reportTypes->values()),
        ];
    }

    public function exportStatus(string $exportId): JsonResponse
    {
        $status = Cache::get("export.{$exportId}");

        if (!$status) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Export not found or expired',
            ], 404);
        }

        return response()->json($status);
    }

    public function exportDownload(string $exportId): StreamedResponse
    {
        $status = Cache::get("export.{$exportId}");

        if (!$status || $status['status'] !== 'completed') {
            abort(404, 'Export not found or not ready');
        }

        $filePath = storage_path("app/exports/{$status['file_path']}");

        if (!file_exists($filePath)) {
            abort(404, 'Export file not found');
        }

        return response()->streamDownload(function () use ($filePath) {
            echo file_get_contents($filePath);
        }, basename($status['file_path']), [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
