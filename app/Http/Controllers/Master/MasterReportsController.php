<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\ReportsRequest;
use App\Http\Resources\AspectsCollection;
use Illuminate\Http\Request;
use App\Models\Master\MasterReports;
use Inertia\Inertia;
use App\Http\Resources\MasterReportsCollection;
use App\Models\Master\ReportTypes;
use App\Models\Master\MasterInputs;
use App\Http\Resources\MasterInputsResource;
use App\Http\Resources\MasterReportsResource;
use App\Http\Resources\ReportTypesCollection;
use App\Models\Master\Aspects;

class MasterReportsController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $query = MasterReports::with('reportType');
        if ($request->has('search')) {
            $query->where('desc_indicator', 'like', "%{$request->get('search')}%")
                ->orWhere('desc_formula', 'like', "%{$request->get('search')}%");
        }
        if ($request->has("reportTypeId")) {
            $reportTypeId = $request->get("reportTypeId");
            if (!is_numeric($reportTypeId)) {
                $reportType = ReportTypes::whereSqid($reportTypeId)->first();
                if ($reportType) {
                    $reportTypeId = $reportType->id;
                }
            }
            $query->where('report_type_id', $reportTypeId);
        }
        if ($request->has("aspectId")) {
            $aspectId = $request->get("aspectId");
            if (!is_numeric($aspectId)) {
                $aspect = Aspects::whereSqid($aspectId)->first();
                if ($aspect) {
                    $aspectId = $aspect->id;
                }
            }
            $query->where('aspect_id', $aspectId);
        }
        $masterReports = $query->paginate($perPage);

        $reportTypes = ReportTypes::all();
        $aspects = Aspects::all();
        return Inertia::render('master/reports/index', [
            'page' => new MasterReportsCollection($masterReports),
            'reportTypes' => new ReportTypesCollection($reportTypes),
            'aspects' => new AspectsCollection($aspects),
            'filters' => $request->only(['search', 'reportTypeId', 'aspectId']),
        ]);
    }

    public function add()
    {
        $reportTypes = ReportTypes::all();
        $aspects = Aspects::all();
        $availableCode = MasterInputs::all()
            ->map(function (MasterInputs $input) {
                $result = new MasterInputsResource($input);

                return [
                    'kode' => $result->kode,
                    'description' => $result->description,
                ];
            })
            ->toArray();

        return Inertia::render('master/reports/add', [
            'reportTypes' => new ReportTypesCollection($reportTypes),
            'aspects' => new AspectsCollection($aspects),
            'availableCode' => $availableCode,
        ]);
    }

    public function store(ReportsRequest $request)
    {
        $requestData = $request->validated();
        MasterReports::create($requestData);

        return redirect()->route('master.reports')->with('success', 'Report created successfully');
    }

    public function edit(MasterReports $report)
    {
        $reportTypes = ReportTypes::all();
        $aspects = Aspects::all();
        $availableCode = MasterInputs::all()
            ->map(function (MasterInputs $input) {
                $result = new MasterInputsResource($input);

                return [
                    'kode' => $result->kode,
                    'description' => $result->description,
                ];
            })
            ->toArray();

        return Inertia::render('master/reports/edit', [
            'reportTypes' => new ReportTypesCollection($reportTypes),
            'aspects' => new AspectsCollection($aspects),
            'availableCode' => $availableCode,
            'data' => new MasterReportsResource($report),
        ]);
    }

    public function update(ReportsRequest $request, MasterReports $report)
    {
        $requestData = $request->validated();
        $report->update($requestData);

        return redirect()->route('master.reports')->with('success', 'Report updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, MasterReports $report)
    {
        $report->delete();

        return redirect()->route('master.reports')->with('success', 'Report deleted successfully');
    }
}
