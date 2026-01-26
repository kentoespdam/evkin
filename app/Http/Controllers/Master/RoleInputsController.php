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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleInputsController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->per_page ?? 10;

        $roleInputs = RoleInputs::with('role', 'masterInput')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->whereHas('role', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('masterInput', fn ($q) => $q->where('description', 'like', "%{$search}%"));
            })
            ->paginate($perPage);

        return Inertia::render('master/role-inputs/index', [
            'page' => new RoleInputsCollection($roleInputs),
        ]);
    }

    public function add(): Response
    {
        return Inertia::render('master/role-inputs/add', [
            'inputs' => new MasterInputsCollection(MasterInputs::all()),
            'roles' => new RolesCollection(Roles::all()),
        ]);
    }

    public function store(RoleInputsRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $this->syncRoleInputs($validated['role_id'], $validated['master_input_ids']);

        return redirect()
            ->route('master.role-inputs')
            ->with('success', 'Role Input created successfully');
    }

    public function edit(Roles $role): Response
    {
        $existingInputIds = RoleInputs::where('role_id', $role->id)
            ->pluck('master_input_id')
            ->map(fn ($id) => MasterInputs::find($id)?->sqid)
            ->filter()
            ->values()
            ->toArray();

        return Inertia::render('master/role-inputs/edit', [
            'inputs' => new MasterInputsCollection(MasterInputs::all()),
            'roles' => new RolesCollection(Roles::all()),
            'data' => [
                'id' => $role->sqid,
                'role' => new RolesResource($role),
                'existingInputIds' => $existingInputIds,
            ],
        ]);
    }

    public function update(RoleInputsRequest $request, Roles $role): RedirectResponse
    {
        $validated = $request->validated();
        $this->syncRoleInputs($validated['role_id'], $validated['master_input_ids']);

        return redirect()
            ->route('master.role-inputs')
            ->with('success', 'Role Input updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, RoleInputs $roleInput): RedirectResponse
    {
        $roleInput->delete();

        return redirect()
            ->route('master.role-inputs')
            ->with('success', 'Role Input deleted successfully');
    }

    private function syncRoleInputs(int $roleId, array $inputIds): void
    {
        RoleInputs::where('role_id', $roleId)->delete();
        RoleInputs::insert(array_map(
            fn ($inputId) => ['role_id' => $roleId, 'master_input_id' => $inputId],
            $inputIds
        ));
    }
}
