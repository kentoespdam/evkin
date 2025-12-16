<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\Reports\CreateReportRequest;
use App\Http\Requests\Master\Reports\UpdateReportRequest;
use App\Http\Resources\MasterInputsResource;
use App\Http\Resources\MasterReportsCollection;
use App\Http\Resources\MasterReportsResource;
use App\Http\Resources\ReportTypesCollection;
use App\Models\Master\MasterInputs;
use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterReportsController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $query = MasterReports::with('reportType');
        if ($request->has('search')) {
            $query->where('kode', 'like', "%{$request->get('search')}%")
                ->orWhere('description', 'like', "%{$request->get('search')}%");
        }
        $masterReports = $query->paginate($perPage);

        return Inertia::render('master/reports/index', [
            'page' => new MasterReportsCollection($masterReports),
        ]);
    }

    public function add()
    {
        $reportTypes = ReportTypes::all();
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
            'availableCode' => $availableCode,
        ]);
    }

    public function store(CreateReportRequest $request)
    {
        $requestData = $request->validated();
        MasterReports::create($requestData);

        return redirect()->route('master.reports')->with('success', 'Report created successfully');
    }

    public function edit(MasterReports $report)
    {
        $reportTypes = ReportTypes::all();
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
            'availableCode' => $availableCode,
            'data' => new MasterReportsResource($report),
        ]);
    }

    public function update(UpdateReportRequest $request, MasterReports $report)
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
