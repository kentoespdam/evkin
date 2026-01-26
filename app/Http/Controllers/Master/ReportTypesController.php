<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\ReportTypesRequest;
use App\Http\Resources\ReportTypesCollection;
use App\Http\Resources\ReportTypesResource;
use App\Models\Master\ReportTypes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportTypesController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->per_page ?? 10;

        $reportTypes = ReportTypes::when($request->filled('search'), function ($query) use ($request) {
            $query->where('name', 'like', "%{$request->get('search')}%");
        })
            ->paginate($perPage);

        return Inertia::render('master/report-types/index', [
            'page' => new ReportTypesCollection($reportTypes),
        ]);
    }

    public function add(): Response
    {
        return Inertia::render('master/report-types/add', [
            'sources' => $this->getAllReportTypes(),
        ]);
    }

    public function store(ReportTypesRequest $request): RedirectResponse
    {
        ReportTypes::create($request->validated());

        return redirect()
            ->route('master.report-types')
            ->with('success', 'Report Type created successfully');
    }

    public function edit(ReportTypes $reportType): Response
    {
        return Inertia::render('master/report-types/edit', [
            'data' => new ReportTypesResource($reportType),
            'sources' => $this->getAllReportTypes(),
        ]);
    }

    public function update(ReportTypesRequest $request, ReportTypes $reportType): RedirectResponse
    {
        $reportType->update($request->validated());

        return redirect()
            ->route('master.report-types')
            ->with('success', 'Report Type updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, ReportTypes $reportType): RedirectResponse
    {
        $reportType->delete();

        return redirect()
            ->route('master.report-types')
            ->with('success', 'Report Type deleted successfully');
    }

    private function getAllReportTypes(): ReportTypesCollection
    {
        return new ReportTypesCollection(ReportTypes::all());
    }
}
