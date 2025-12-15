<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Inputs\CreateInputRequest;
use App\Http\Requests\Master\Inputs\DeleteInputRequest;
use App\Http\Requests\Master\Inputs\UpdateInputRequest;
use App\Http\Resources\MasterInputsCollection;
use App\Http\Resources\MasterInputsResource;
use App\Models\Master\MasterInputs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterInputController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $query = MasterInputs::query();
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->get('search')}%");
        }
        $masterInputs = $query->paginate($perPage);

        return Inertia::render('master/inputs/index', [
            'page' => new MasterInputsCollection($masterInputs),
        ]);
    }

    public function add()
    {

        return Inertia::render('master/inputs/add');
    }

    public function store(CreateInputRequest $request)
    {

        if (MasterInputs::where('name', $request->input('name')->exists())) {
            return redirect()->route('master.inputs')->with('error', 'Input already exists');
        }

        $requestData = $request->validated();

        MasterInputs::create($requestData);

        return redirect()->route('master.inputs')->with('success', 'Input created successfully');
    }

    public function edit(MasterInputs $masterInputs)
    {

        return Inertia::render('master/inputs/edit', [
            'page' => new MasterInputsResource($masterInputs),
        ]);
    }

    public function update(UpdateInputRequest $request, MasterInputs $masterInputs)
    {
        $requestData = $request->validated();
        $masterInputs->update($requestData);

        return redirect()->route('master.inputs')->with('success', 'Input updated successfully');
    }

    public function destroy(DeleteInputRequest $request, MasterInputs $masterInputs)
    {
        $masterInputs->delete();

        return redirect()->route('master.inputs')->with('success', 'Input deleted successfully');
    }
}
