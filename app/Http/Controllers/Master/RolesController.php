<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\Roles\CreateRoleRequest;
use App\Http\Requests\Master\Roles\UpdateRoleRequest;
use App\Http\Resources\RolesCollection;
use App\Http\Resources\RolesResource;
use App\Http\Resources\UserResource;
use App\Models\Master\Roles;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RolesController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $perPage = $request->per_page ?? 10;

        $query = Roles::query();

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->get('search')}%");
        }

        $roles = $query->paginate($perPage);

        return Inertia::render('master/roles/index', [
            'page' => new RolesCollection($roles),
            'user' => new UserResource($request->user()),
        ]);
    }

    public function add(): Response|RedirectResponse
    {
        return Inertia::render('master/roles/add');
    }

    public function store(CreateRoleRequest $request): RedirectResponse
    {
        // check if role already exists
        if (Roles::where('name', $request->name)->exists()) {
            return redirect()->route('master.roles')->with('error', 'Role already exists');
        }
        Roles::create($request->all());

        return redirect()->route('master.roles')->with('success', 'Role created successfully');
    }

    public function edit(Roles $role): Response|RedirectResponse
    {
        return Inertia::render('master/roles/edit', [
            'role' => new RolesResource($role),
        ]);
    }

    public function update(UpdateRoleRequest $request, Roles $role): RedirectResponse
    {
        $role->update($request->all());

        return redirect()->route('master.roles')->with('success', 'Role updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, Roles $role): RedirectResponse
    {
        $role->delete();

        return redirect()->route('master.roles')->with('success', 'Role deleted successfully');
    }
}
