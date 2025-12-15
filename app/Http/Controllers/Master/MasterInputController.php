<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Inputs\CreateInputRequest;
use App\Http\Requests\Master\Inputs\DeleteInputRequest;
use App\Http\Requests\Master\Inputs\UpdateInputRequest;
use App\Http\Resources\MasterInputsCollection;
use App\Http\Resources\MasterInputsResource;
use App\Http\Resources\MasterSourcesCollection;
use App\Models\Master\MasterInputs;
use App\Models\Master\MasterSources;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterInputController extends Controller
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

        return Inertia::render('master/inputs/index', [
            'page' => new MasterInputsCollection($masterInputs),
        ]);
    }

    public function add()
    {
        $sources = MasterSources::all();

        return Inertia::render('master/inputs/add', [
            'sources' => new MasterSourcesCollection($sources),
        ]);
    }

    public function store(CreateInputRequest $request)
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

        return Inertia::render('master/inputs/edit', [
            'data' => new MasterInputsResource($input),
            'sources' => new MasterSourcesCollection($sources),
        ]);
    }

    public function update(UpdateInputRequest $request, MasterInputs $input)
    {
        $requestData = $request->validated();
        $input->update($requestData);

        return redirect()->route('master.inputs')->with('success', 'Input updated successfully');
    }

    public function destroy(DeleteInputRequest $request, MasterInputs $input)
    {
        $input->delete();

        return redirect()->route('master.inputs')->with('success', 'Input deleted successfully');
    }
}
