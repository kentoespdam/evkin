<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\ReportsRequest;
use App\Http\Resources\AspectsCollection;
use App\Http\Resources\MasterInputsResource;
use App\Http\Resources\MasterReportsCollection;
use App\Http\Resources\MasterReportsResource;
use App\Http\Resources\ReportTypesCollection;
use App\Models\Master\Aspects;
use App\Models\Master\MasterInputs;
use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasterReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->per_page ?? 10;

        $masterReports = MasterReports::with('reportType')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where('desc_indicator', 'like', "%{$search}%")
                    ->orWhere('desc_formula', 'like', "%{$search}%");
            })
            ->when($request->filled('reportTypeId'), function ($query) use ($request) {
                $reportTypeId = $request->get('reportTypeId');
                if (! is_numeric($reportTypeId)) {
                    $reportType = ReportTypes::whereSqid($reportTypeId)->first();
                    $reportTypeId = $reportType?->id;
                }
                if ($reportTypeId) {
                    $query->where('report_type_id', $reportTypeId);
                }
            })
            ->when($request->filled('aspectId'), function ($query) use ($request) {
                $aspectId = $request->get('aspectId');
                if (! is_numeric($aspectId)) {
                    $aspect = Aspects::whereSqid($aspectId)->first();
                    $aspectId = $aspect?->id;
                }
                if ($aspectId) {
                    $query->where('aspect_id', $aspectId);
                }
            })
            ->paginate($perPage);

        return Inertia::render('master/reports/index', [
            'page' => new MasterReportsCollection($masterReports),
            'reportTypes' => new ReportTypesCollection(ReportTypes::all()),
            'aspects' => new AspectsCollection(Aspects::all()),
            'filters' => $request->only(['search', 'reportTypeId', 'aspectId']),
        ]);
    }

    public function add(): Response
    {
        return Inertia::render('master/reports/add', [
            'reportTypes' => new ReportTypesCollection(ReportTypes::all()),
            'aspects' => new AspectsCollection(Aspects::all()),
            'availableCode' => $this->getAvailableInputCodes(),
        ]);
    }

    public function store(ReportsRequest $request): RedirectResponse
    {
        MasterReports::create($request->validated());

        return redirect()
            ->route('master.reports')
            ->with('success', 'Report created successfully');
    }

    public function edit(MasterReports $report): Response
    {
        return Inertia::render('master/reports/edit', [
            'reportTypes' => new ReportTypesCollection(ReportTypes::all()),
            'aspects' => new AspectsCollection(Aspects::all()),
            'availableCode' => $this->getAvailableInputCodes(),
            'data' => new MasterReportsResource($report),
        ]);
    }

    public function update(ReportsRequest $request, MasterReports $report): RedirectResponse
    {
        $report->update($request->validated());

        return redirect()
            ->route('master.reports')
            ->with('success', 'Report updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, MasterReports $report): RedirectResponse
    {
        $report->delete();

        return redirect()
            ->route('master.reports')
            ->with('success', 'Report deleted successfully');
    }

    private function getAvailableInputCodes(): array
    {
        return MasterInputs::all()
            ->map(fn (MasterInputs $input) => new MasterInputsResource($input))
            ->map(fn ($resource) => [
                'kode' => $resource->kode,
                'description' => $resource->description,
            ])
            ->toArray();
    }
}
