<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\AspectsRequest;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Resources\AspectsCollection;
use App\Http\Resources\AspectsResource;
use App\Models\Master\Aspects;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AspectsController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;

        $query = Aspects::query();

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->get('search')}%");
        }

        $aspects = $query->paginate($perPage);

        return Inertia::render('master/aspects/index', [
            'page' => new AspectsCollection($aspects),
        ]);
    }

    public function add()
    {
        return Inertia::render('master/aspects/add');
    }

    public function store(AspectsRequest $request)
    {
        // check if aspect already exists
        if (Aspects::where('name', $request->name)->exists()) {
            return redirect()->route('master.aspects')->with('error', 'Aspect already exists');
        }
        Aspects::create($request->all());

        return redirect()->route('master.aspects')->with('success', 'Aspect created successfully');
    }

    public function edit(Aspects $aspect)
    {
        return Inertia::render('master/aspects/edit', [
            'aspect' => new AspectsResource($aspect),
        ]);
    }

    public function update(AspectsRequest $request, Aspects $aspect)
    {
        $aspect->update($request->all());

        return redirect()->route('master.aspects')->with('success', 'Aspect updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, Aspects $aspect)
    {
        $aspect->delete();

        return redirect()->route('master.aspects')->with('success', 'Aspect deleted successfully');
    }
}