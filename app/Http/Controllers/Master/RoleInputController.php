<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\RoleInputs\CreateRoleInputRequest;
use App\Http\Requests\Master\RoleInputs\DeleteRoleInputRequest;
use App\Http\Requests\Master\RoleInputs\UpdateRoleInputRequest;
use App\Http\Resources\RoleInputsCollection;
use App\Http\Resources\RoleInputsResource;
use App\Models\Master\RoleInputs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleInputController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $query = RoleInputs::query();
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->get('search')}%");
        }
        $roleInputs = $query->paginate($perPage);

        return Inertia::render('master/role-inputs/index', [
            'page' => new RoleInputsCollection($roleInputs),
        ]);
    }

    public function add()
    {
        return Inertia::render('master/role-inputs/add');
    }

    public function store(CreateRoleInputRequest $request)
    {
        RoleInputs::create($request->all());

        return redirect()->route('master.role-inputs.index')->with('success', 'Role Input created successfully');
    }

    public function edit(RoleInputs $roleInputs)
    {

        return Inertia::render('master/role-inputs/edit', [
            'page' => new RoleInputsResource($roleInputs),
        ]);
    }

    public function update(UpdateRoleInputRequest $request, RoleInputs $roleInputs)
    {

        $roleInputs->update($request->all());

        return redirect()->route('master.role-inputs.index')->with('success', 'Role Input updated successfully');
    }

    public function destroy(DeleteRoleInputRequest $request, RoleInputs $roleInputs)
    {
        $roleInputs->delete();

        return redirect()->route('master.role-inputs.index')->with('success', 'Role Input deleted successfully');
    }
}
