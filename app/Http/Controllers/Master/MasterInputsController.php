<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\InputsRequest;
use App\Http\Requests\Master\InputsUpdateRequest;
use App\Http\Resources\MasterInputsCollection;
use App\Http\Resources\MasterInputsResource;
use App\Http\Resources\MasterSourcesCollection;
use App\Models\Master\MasterInputs;
use App\Models\Master\MasterSources;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasterInputsController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->per_page ?? 10;

        $masterInputs = MasterInputs::with('masterSource')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where('kode', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->paginate($perPage);

        return Inertia::render('master/master-inputs/index', [
            'page' => new MasterInputsCollection($masterInputs),
        ]);
    }

    public function add(): Response
    {
        return Inertia::render('master/master-inputs/add', [
            'sources' => new MasterSourcesCollection(MasterSources::all()),
        ]);
    }

    public function store(InputsRequest $request): RedirectResponse
    {
        MasterInputs::create($request->validated());

        return redirect()
            ->route('master.inputs')
            ->with('success', 'Input created successfully');
    }

    public function edit(MasterInputs $input): Response
    {
        return Inertia::render('master/master-inputs/edit', [
            'data' => new MasterInputsResource($input),
            'sources' => new MasterSourcesCollection(MasterSources::all()),
        ]);
    }

    public function update(InputsUpdateRequest $request, MasterInputs $input): RedirectResponse
    {
        $input->update($request->validated());

        return redirect()
            ->route('master.inputs')
            ->with('success', 'Input updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, MasterInputs $input): RedirectResponse
    {
        $input->delete();

        return redirect()
            ->route('master.inputs')
            ->with('success', 'Input deleted successfully');
    }
}
