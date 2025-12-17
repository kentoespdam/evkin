<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\ReportTypes\CreateReportTypeRequest;
use App\Http\Requests\Master\ReportTypes\UpdateReportTypeRequest;
use App\Http\Resources\ReportTypesCollection;
use App\Http\Resources\ReportTypesResource;
use App\Models\Master\ReportTypes;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportTypesController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $query = ReportTypes::query();
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->get('search')}%");
        }
        $result = $query->paginate($perPage);

        return Inertia::render('master/report-types/index', [
            'page' => new ReportTypesCollection($result),
        ]);
    }

    public function add()
    {
        $result = ReportTypes::all();

        return Inertia::render('master/report-types/add', [
            'sources' => new ReportTypesCollection($result),
        ]);
    }

    public function store(CreateReportTypeRequest $request)
    {

        if (ReportTypes::where('name', $request->input('name'))->exists()) {
            return redirect()->route('master.report-types')->with('error', 'Report Type already exists');
        }

        $requestData = $request->validated();

        ReportTypes::create($requestData);

        return redirect()->route('master.report-types')->with('success', 'Report Type created successfully');
    }

    public function edit(ReportTypes $reportType)
    {
        $result = ReportTypes::all();

        return Inertia::render('master/report-types/edit', [
            'data' => new ReportTypesResource($reportType),
            'sources' => new ReportTypesCollection($result),
        ]);
    }

    public function update(UpdateReportTypeRequest $request, ReportTypes $reportType)
    {
        $requestData = $request->validated();
        $reportType->update($requestData);

        return redirect()->route('master.report-types')->with('success', 'Report Type updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, ReportTypes $reportType)
    {
        $reportType->delete();

        return redirect()->route('master.report-types')->with('success', 'Report Type deleted successfully');
    }
}
