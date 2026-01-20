<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Http\Resources\AspectsCollection;
use App\Http\Resources\MasterReportsCollection;
use App\Http\Resources\PerhitunganReportsCollection;
use App\Http\Resources\ReportTypesCollection;
use App\Models\Master\Aspects;
use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PerhitunganReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $year = (int) ($request->year ?? date('Y'));
        $reportTypeId = $this->getReportTypeId($request->report_type_id);
        $defaultReportTypeSqid = $this->getDefaultReportTypeSqid();

        $masterReports = MasterReports::query()
            ->where('report_type_id', $reportTypeId)
            ->when($request->filled('search'), fn($query) => $this->applySearch($query, $request->search))
            ->get();

        $reports = PerhitunganReports::with('masterReport')
            ->where('year', $year)
            ->whereHas('masterReport', fn($query) => $query->where('report_type_id', $reportTypeId))
            ->when($request->filled('search'), fn($query) => $this->applyMasterReportSearch($query, $request->search))
            ->get();

        return Inertia::render('report/perhitungan_reports/index', [
            'masterReports' => new MasterReportsCollection($masterReports),
            'reportTypes' => new ReportTypesCollection(ReportTypes::all()),
            'aspects' => new AspectsCollection(Aspects::all()),
            'reports' => new PerhitunganReportsCollection($reports),
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

        $query = PerhitunganReports::with('masterReport')
            ->where('year', $year)
            ->where('month', $month)
            ->whereHas('masterReport', fn($q) => $q->where('report_type_id', $reportTypeId))
            ->when($request->filled('search'), fn($q) => $q->where('desc_indicator', 'like', "%{$request->search}%"))
            ->when($request->filled('aspect_id'), function ($q) use ($request) {
                $aspectId = $this->getAspectId($request->aspect_id);
                if ($aspectId) {
                    $q->whereHas('masterReport', fn($query) => $query->where('aspect_id', $aspectId));
                }
            });

        return Inertia::render('report/perhitungan_reports/detail', [
            'page' => new PerhitunganReportsCollection($query->paginate($perPage)),
            'reportTypes' => new ReportTypesCollection(ReportTypes::all()),
            'aspects' => new AspectsCollection(Aspects::all()),
            'filters' => [
                'report_type_id' => $request->report_type_id ?? $defaultReportTypeSqid,
                'aspect_id' => $request->aspect_id ?? '',
                'year' => $year,
                'month' => $month,
                'search' => $request->search ?? '',
            ],
        ]);
    }

    private function getDefaultReportTypeSqid(): string
    {
        return ReportTypes::query()->first()?->sqid ?? '';
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

    private function applySearch(Builder $query, string $search): Builder
    {
        return $query->where('desc_indicator', 'like', "%{$search}%");
    }

    private function applyMasterReportSearch(Builder $query, string $search): Builder
    {
        return $query->whereHas('masterReport', fn($q) => $q->where('desc_indicator', 'like', "%{$search}%"));
    }
}
