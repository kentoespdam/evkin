<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Sources\CreateSourceRequest;
use App\Http\Requests\Master\Sources\DeleteSourceRequest;
use App\Http\Requests\Master\Sources\UpdateSourceRequest;
use App\Http\Resources\MasterSourcesCollection;
use App\Http\Resources\MasterSourcesResource;
use App\Models\Master\MasterSources;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasterSourceController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->per_page ?? 10;
        $query = MasterSources::query();
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->get('search')}%");
        }
        $masterSources = $query->paginate($perPage);

        return Inertia::render('master/sources/index', [
            'page' => new MasterSourcesCollection($masterSources),
        ]);
    }

    public function add(): Response
    {
        return Inertia::render('master/sources/add');
    }

    public function store(CreateSourceRequest $request): RedirectResponse
    {
        if (MasterSources::where('name', $request->name)->exists()) {
            return redirect()->route('master.sources.add')->with('error', 'Master Source already exists');
        }

        // $masterSourceData = $request->validated();

        MasterSources::create($request->validated());

        return redirect()->route('master.sources')->with('success', 'Master Source created successfully');
    }

    public function edit(MasterSources $source): Response
    {
        return Inertia::render('master/sources/edit', [
            'source' => new MasterSourcesResource($source),
        ]);
    }

    public function update(UpdateSourceRequest $request, MasterSources $source): RedirectResponse
    {
        $sourceData = $request->validated();

        $source->update($sourceData);

        return redirect()->route('master.sources')->with('success', 'Master Source updated successfully');
    }

    public function destroy(DeleteSourceRequest $request, MasterSources $source)
    {
        try {
            $source->delete();

            return redirect()->route('master.sources')->with('success', 'Master Source deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back('master.sources')->withErrors(['error' => 'Master Source deleted failed']);
        }
    }
}
