<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\RoleInputsRequest;
use App\Http\Resources\MasterInputsCollection;
use App\Http\Resources\RoleInputsCollection;
use App\Http\Resources\RolesCollection;
use App\Http\Resources\RolesResource;
use App\Models\Master\MasterInputs;
use App\Models\Master\RoleInputs;
use App\Models\Master\Roles;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleInputsController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $perPage = $request->per_page ?? 10;
        $search = $request->search;

        $query = RoleInputs::with('role', 'masterInput')
            ->when($search, function ($query) use ($search) {
                $query->whereHas('role', fn($q) =>
                    $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('masterInput', fn($q) =>
                        $q->where('description', 'like', "%{$search}%"));
            });

        $roleInputs = $query->paginate($perPage);

        return Inertia::render('master/role-inputs/index', [
            'page' => new RoleInputsCollection($roleInputs),
        ]);
    }

    public function add(): \Inertia\Response
    {
        $inputs = MasterInputs::all();
        $roles = Roles::all();

        return Inertia::render('master/role-inputs/add', [
            'inputs' => new MasterInputsCollection($inputs),
            'roles' => new RolesCollection($roles),
        ]);
    }

    public function store(RoleInputsRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();
        $roleId = $validated['role_id'];
        $inputIds = $validated['master_input_ids'];

        foreach ($inputIds as $inputId) {
            RoleInputs::updateOrCreate([
                'role_id' => $roleId,
                'master_input_id' => $inputId,
            ]);
        }

        return redirect()->route('master.role-inputs')->with('success', 'Role Input created successfully');
    }

    public function edit(Roles $role): \Inertia\Response
    {
        $inputs = MasterInputs::all();
        $roles = Roles::all();

        // Get all inputs associated with this role and map to sqids
        $existingInputIds = RoleInputs::query()
            ->where('role_id', $role->id)
            ->pluck('master_input_id')
            ->map(fn($id) => MasterInputs::find($id)?->sqid)
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

    public function update(RoleInputsRequest $request, Roles $role): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();
        $roleId = $validated['role_id'];
        $inputIds = $validated['master_input_ids'];


        // Delete all existing role_inputs for this role
        RoleInputs::where('role_id', $roleId)->delete();

        $data = array_map(function ($inputId) use ($roleId) {
            return [
                'role_id' => $roleId,
                'master_input_id' => $inputId,
            ];
        }, $inputIds);
        RoleInputs::insert($data);

        return redirect()->route('master.role-inputs')->with('success', 'Role Input updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, RoleInputs $roleInput): \Illuminate\Http\RedirectResponse
    {
        $roleInput->delete();

        return redirect()->route('master.role-inputs')->with('success', 'Role Input deleted successfully');
    }
}
