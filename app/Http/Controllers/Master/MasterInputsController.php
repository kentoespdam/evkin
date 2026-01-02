<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\InputsRequest;
use Illuminate\Http\Request;
use App\Models\Master\MasterInputs;
use Inertia\Inertia;
use App\Http\Resources\MasterInputsCollection;
use App\Models\Master\MasterSources;
use App\Http\Resources\MasterSourcesCollection;
use App\Http\Resources\MasterInputsResource;

class MasterInputsController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $query = MasterInputs::with('masterSource');
        if ($request->has('search')) {
            $query->where('kode', 'like', "%{$request->get('search')}%")
                ->orWhere('description', 'like', "%{$request->get('search')}%");
        }
        $masterInputs = $query->paginate($perPage);

        return Inertia::render('master/master-inputs/index', [
            'page' => new MasterInputsCollection($masterInputs),
        ]);
    }

    public function add()
    {
        $sources = MasterSources::all();

        return Inertia::render('master/master-inputs/add', [
            'sources' => new MasterSourcesCollection($sources),
        ]);
    }

    public function store(InputsRequest $request)
    {

        if (MasterInputs::where('kode', $request->input('kode'))->exists()) {
            return redirect()->route('master.inputs')->with('error', 'Input already exists');
        }

        $requestData = $request->validated();

        MasterInputs::create($requestData);

        return redirect()->route('master.inputs')->with('success', 'Input created successfully');
    }

    public function edit(MasterInputs $input)
    {
        $sources = MasterSources::all();

        return Inertia::render('master/master-inputs/edit', [
            'data' => new MasterInputsResource($input),
            'sources' => new MasterSourcesCollection($sources),
        ]);
    }

    public function update(InputsRequest $request, MasterInputs $input)
    {
        $requestData = $request->validated();
        $input->update($requestData);

        return redirect()->route('master.inputs')->with('success', 'Input updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, MasterInputs $input)
    {
        $input->delete();

        return redirect()->route('master.inputs')->with('success', 'Input deleted successfully');
    }
}
