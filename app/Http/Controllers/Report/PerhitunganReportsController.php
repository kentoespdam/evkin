<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExportDetailRequest;
use App\Http\Requests\ExportIndexRequest;
use App\Http\Resources\AspectsCollection;
use App\Http\Resources\MasterReportsCollection;
use App\Http\Resources\PerhitunganReportsCollection;
use App\Http\Resources\ReportTypesCollection;
use App\Jobs\ProcessExportJob;
use App\Models\Master\Aspects;
use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use App\Models\User;
use App\Services\PerhitunganReportExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PerhitunganReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $year = (int) ($request->year ?? date('Y'));
        $reportTypeId = $this->getReportTypeId($request->report_type_id);
        $defaultReportTypeSqid = $this->getDefaultReportTypeSqid();

        $masterReports = MasterReports::where('report_type_id', $reportTypeId)
            ->when($request->filled('search'), fn($query) => $query->where('desc_indicator', 'like', "%{$request->search}%"))
            ->get();

        $reports = $this->getPerhitunganReports($year, $reportTypeId, $request->search, includeLastDecember: true);
        $reportsDecemberLastYear = $this->getDecemberLastYearReports($year - 1, $reportTypeId, $request->search);
        $aspects = Aspects::where('report_type_id', $reportTypeId)->get();

        return Inertia::render('report/perhitungan_reports/index', [
            'masterReports' => new MasterReportsCollection($masterReports),
            'reportTypes' => new ReportTypesCollection(ReportTypes::all()),
            'aspects' => new AspectsCollection($aspects),
            'reports' => new PerhitunganReportsCollection($reports),
            'reportsDecemberLastYear' => new PerhitunganReportsCollection($reportsDecemberLastYear),
            'filters' => [
                'report_type_id' => $request->report_type_id ?? $defaultReportTypeSqid,
                'aspect_id' => $request->aspect_id ?? '',
                'year' => $year,
                'search' => $request->search ?? '',
            ],
        ]);
    }

    public function detail(Request $request): Response
    {
        $year = (int) ($request->year ?? date('Y'));
        $month = (int) ($request->month ?? date('m'));
        $perPage = (int) ($request->per_page ?? 10);
        $reportTypeId = $this->getReportTypeId($request->report_type_id);
        $defaultReportTypeSqid = $this->getDefaultReportTypeSqid();

        $reports = PerhitunganReports::with('masterReport')
            ->where('year', $year)
            ->where('month', $month)
            ->whereHas('masterReport', fn($q) => $q->where('report_type_id', $reportTypeId))
            ->when($request->filled('search'), fn($q) => $q->where('desc_indicator', 'like', "%{$request->search}%"))
            ->when($request->filled('aspect_id'), function ($q) use ($request) {
                $aspectId = $this->getAspectId($request->aspect_id);
                if ($aspectId) {
                    return $q->whereHas('masterReport', fn($inner) => $inner->where('aspect_id', $aspectId));
                }

                return $q;
            })
            ->paginate($perPage);

        return Inertia::render('report/perhitungan_reports/detail', [
            'page' => new PerhitunganReportsCollection($reports),
            'reportTypes' => new ReportTypesCollection(ReportTypes::all()),
            'aspects' => new AspectsCollection(Aspects::where('report_type_id', $reportTypeId)->get()),
            'filters' => [
                'report_type_id' => $request->report_type_id ?? $defaultReportTypeSqid,
                'aspect_id' => $request->aspect_id ?? '',
                'year' => $year,
                'month' => $month,
                'search' => $request->search ?? '',
            ],
        ]);
    }

    public function exportDetail(ExportDetailRequest $request): StreamedResponse
    {
        Log::info('Excel Export Detail', $request->validated());

        return (new PerhitunganReportExportService)->exportDetail(
            $request->validated()
        );
    }

    public function exportIndex(ExportIndexRequest $request): JsonResponse
    {
        $exportId = Str::uuid()->toString();
        $filters = $request->validated();

        // Initialize cache with pending status
        Cache::put("export.{$exportId}", [
            'status' => 'pending',
            'progress' => 0,
            'created_at' => now(),
        ], 3600);

        $authId = (int) auth($request->user)->id();

        // Dispatch job
        ProcessExportJob::dispatch($exportId, $filters, $authId, 'index');

        Log::info('Export Index Queued', [
            'export_id' => $exportId,
            'filters' => $filters,
        ]);

        return response()->json([
            'export_id' => $exportId,
            'message' => 'Export is being processed',
        ]);
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

        $filePath = storage_path("app/{$status['file_path']}");

        if (!file_exists($filePath)) {
            abort(404, 'Export file not found');
        }

        return response()->streamDownload(function () use ($filePath) {
            echo file_get_contents($filePath);
        }, basename($status['file_path']), [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function getPerhitunganReports(int $year, ?int $reportTypeId, ?string $search, bool $includeLastDecember = false): Collection
    {
        $query = PerhitunganReports::with('masterReport')
            ->where('year', $year)
            ->whereHas('masterReport', fn($q) => $q->where('report_type_id', $reportTypeId));

        if ($includeLastDecember) {
            $query->orWhere(function ($q) use ($year, $reportTypeId) {
                $q->where('year', $year - 1)
                    ->where('month', 12)
                    ->whereHas('masterReport', fn($inner) => $inner->where('report_type_id', $reportTypeId));
            });
        }

        return $query->when($search, fn($q) => $q->whereHas('masterReport', fn($inner) => $inner->where('desc_indicator', 'like', "%{$search}%")))
            ->get();
    }

    private function getDecemberLastYearReports(int $year, ?int $reportTypeId, ?string $search): Collection
    {
        return PerhitunganReports::with('masterReport')
            ->where('year', $year)
            ->where('month', 12)
            ->whereHas('masterReport', fn($q) => $q->where('report_type_id', $reportTypeId))
            ->when($search, fn($q) => $q->whereHas('masterReport', fn($inner) => $inner->where('desc_indicator', 'like', "%{$search}%")))
            ->get();
    }

    private function getDefaultReportTypeSqid(): string
    {
        return ReportTypes::first()?->sqid ?? '';
    }

    private function getReportTypeId(?string $sqid = null): ?int
    {
        $sqid = $sqid ?? $this->getDefaultReportTypeSqid();

        return ReportTypes::whereSqid($sqid)->first()?->id;
    }

    private function getAspectId(string $sqid): ?int
    {
        return Aspects::whereSqid($sqid)->first()?->id;
    }
}
