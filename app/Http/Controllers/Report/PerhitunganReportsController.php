<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Http\Resources\AspectsCollection;
use App\Http\Resources\PerhitunganReportsCollection;
use App\Http\Resources\ReportTypesCollection;
use App\Models\Master\Aspects;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerhitunganReportsController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) ($request->year ?? date('Y'));
        $defaultReportTypeId = ReportTypes::query()->first()->sqid;
        $reportTypeId = ReportTypes::whereSqid($request->report_type_id ?? $defaultReportTypeId)->first()->id;
        $perPage = $request->per_page ?? 10;

        $page = PerhitunganReports::with('masterReport')
            ->where('year', $year)
            ->whereHas('masterReport', function ($q) use ($reportTypeId) {
                $q->where('report_type_id', $reportTypeId);
            })->paginate($perPage);

        $reportTypes = ReportTypes::all();
        $aspects = Aspects::all();

        return Inertia::render('report/perhitungan_reports/index', [
            'page' => new PerhitunganReportsCollection($page),
            'reportTypes' => new ReportTypesCollection($reportTypes),
            'aspects' => new AspectsCollection($aspects),
            'filters' => [
                'report_type_id' => $request->report_type_id ?? $defaultReportTypeId,
                'aspect_id' => $request->aspect_id ?? '',
                'year' => $year,
                'search' => $request->search ?? '',
            ],
        ]);
    }

    public function detail(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $defaultReportTypeId = ReportTypes::query()->first()->sqid;
        $reportTypeId = ReportTypes::whereSqid($request->report_type_id ?? $defaultReportTypeId)->first()->id;
        $year = (int) ($request->year ?? date('Y'));
        $month = (int) ($request->month ?? date('m'));

        $query = PerhitunganReports::with('masterReport')
            ->where('year', $year)
            ->where('month', $month)
            ->whereHas('masterReport', function ($q) use ($reportTypeId) {
                $q->where('report_type_id', $reportTypeId);
            });

        if ($request->has('search') && ! empty($request->search)) {
            $query = $query->where('desc_indicator', 'like', '%'.$request->search.'%');
        }
        if ($request->has('aspect_id')) {
            $aspectId = Aspects::whereSqid($request->aspect_id)->first()->id;
            if (is_numeric($aspectId)) {
                $query->whereHas('masterReport', function ($q) use ($aspectId) {
                    $q->where('aspect_id', $aspectId);
                });
            }
        }
        $page = $query->paginate($perPage);
        $reportTypes = ReportTypes::all();
        $aspects = Aspects::all();

        return Inertia::render('report/perhitungan_reports/detail', [
            'page' => new PerhitunganReportsCollection($page),
            'reportTypes' => new ReportTypesCollection($reportTypes),
            'aspects' => new AspectsCollection($aspects),
            'filters' => [
                'report_type_id' => $request->report_type_id ?? $defaultReportTypeId,
                'aspect_id' => $request->aspect_id ?? '',
                'year' => $year,
                'month' => $month,
                'search' => $request->search ?? '',
            ],
        ]);
    }
}
