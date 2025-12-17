<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\RoleInputs\CreateRoleInputRequest;
use App\Http\Requests\Master\RoleInputs\UpdateRoleInputRequest;
use App\Http\Resources\MasterInputsCollection;
use App\Http\Resources\RoleInputsCollection;
use App\Http\Resources\RolesCollection;
use App\Http\Resources\RolesResource;
use App\Models\Master\MasterInputs;
use App\Models\Master\RoleInputs;
use App\Models\Master\Roles;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleInputController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $query = RoleInputs::with('role', 'masterInput');
        if ($request->has('search')) {
            $query->whereHas('role', function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->get('search')}%");
            })
                ->orWhereHas('masterInput', function ($query) use ($request) {
                    $query->where('description', 'like', "%{$request->get('search')}%");
                });
        }
        $roleInputs = $query->paginate($perPage);

        return Inertia::render('master/role-inputs/index', [
            'page' => new RoleInputsCollection($roleInputs),
        ]);
    }

    public function add()
    {
        $inputs = MasterInputs::all();
        $roles = Roles::all();

        return Inertia::render('master/role-inputs/add', [
            'inputs' => new MasterInputsCollection($inputs),
            'roles' => new RolesCollection($roles),
        ]);
    }

    public function store(CreateRoleInputRequest $request)
    {
        $roleId = $request->validated()['role_id'];
        $inputIds = $request->validated()['master_input_ids'];

        foreach ($inputIds as $inputId) {
            RoleInputs::updateOrCreate([
                'role_id' => $roleId,
                'master_input_id' => $inputId,
            ]);
        }

        return redirect()->route('master.role-inputs')->with('success', 'Role Input created successfully');
    }

    public function edit(Roles $role)
    {
        $inputs = MasterInputs::all();
        $roles = Roles::all();

        // Get all inputs associated with this role and map to sqids
        $existingInputIds = RoleInputs::where('role_id', $role->id)
            ->pluck('master_input_id')
            ->map(fn ($id) => MasterInputs::find($id)?->sqid)
            ->filter()
            ->values()
            ->toArray();

        return Inertia::render('master/role-inputs/edit', [
            'inputs' => new MasterInputsCollection($inputs),
            'roles' => new RolesCollection($roles),
            'data' => [
                'id' => $role->sqid,
                'role' => new RolesResource($role),
                'existingInputIds' => $existingInputIds,
            ],
        ]);
    }

    public function update(UpdateRoleInputRequest $request, Roles $role)
    {
        $roleId = $request->validated()['role_id'];
        $inputIds = $request->validated()['master_input_ids'];

        // Delete all existing role_inputs for this role
        RoleInputs::where('role_id', $roleId)->delete();

        // Create new records for each selected input
        foreach ($inputIds as $inputId) {
            RoleInputs::create([
                'role_id' => $roleId,
                'master_input_id' => $inputId,
            ]);
        }

        return redirect()->route('master.role-inputs')->with('success', 'Role Input updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, RoleInputs $roleInput)
    {
        $roleInput->delete();

        return redirect()->route('master.role-inputs')->with('success', 'Role Input deleted successfully');
    }
}
