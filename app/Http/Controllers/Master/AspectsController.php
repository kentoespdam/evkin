<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\AspectsRequest;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Resources\AspectsCollection;
use App\Http\Resources\AspectsResource;
use App\Http\Resources\ReportTypesCollection;
use App\Models\Master\Aspects;
use App\Models\Master\ReportTypes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AspectsController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->per_page ?? 10;

        $aspects = Aspects::with('reportTypes')
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->get('search')}%");
            })
            ->paginate($perPage);

        return Inertia::render('master/aspects/index', [
            'page' => new AspectsCollection($aspects),
        ]);
    }

    public function add(): Response
    {
        return Inertia::render('master/aspects/add', [
            'reportTypes' => new ReportTypesCollection(ReportTypes::all()),
        ]);
    }

    public function store(AspectsRequest $request): RedirectResponse
    {
        Aspects::create($request->validated());

        return redirect()
            ->route('master.aspects')
            ->with('success', 'Aspect created successfully');
    }

    public function edit(Aspects $aspect): Response
    {
        return Inertia::render('master/aspects/edit', [
            'reportTypes' => new ReportTypesCollection(ReportTypes::all()),
            'aspect' => new AspectsResource($aspect),
        ]);
    }

    public function update(AspectsRequest $request, Aspects $aspect): RedirectResponse
    {
        $aspect->update($request->validated());

        return redirect()
            ->route('master.aspects')
            ->with('success', 'Aspect updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, Aspects $aspect): RedirectResponse
    {
        $aspect->delete();

        return redirect()
            ->route('master.aspects')
            ->with('success', 'Aspect deleted successfully');
    }
}
