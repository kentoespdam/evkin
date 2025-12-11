<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Roles\CreateRoleRequest;
use App\Http\Requests\Master\Roles\DeleteRoleRequest;
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
    private function checkPermission(Request $request): void
    {
        $user = $request->user();
        if ($user->role_id != 1) {
            throw new \Exception("You don't have permission to access this page");
        }
    }

    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $this->checkPermission($request);
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
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', $e->getMessage());
        }
    }

    public function add(): Response|RedirectResponse
    {
        try {
            $this->checkPermission(request());

            return Inertia::render('master/roles/add');
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', $e->getMessage());
        }

    }

    public function store(CreateRoleRequest $request): RedirectResponse
    {
        try {
            $this->checkPermission(request());
            // check if role already exists
            if (Roles::where('name', $request->name)->exists()) {
                return redirect()->route('master.roles')->with('error', 'Role already exists');
            }
            $role = Roles::create($request->all());

            return redirect()->route('master.roles')->with('success', 'Role created successfully');
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', $e->getMessage());
        }
    }

    public function edit(Roles $role): Response|RedirectResponse
    {
        try {
            $this->checkPermission(request());

            return Inertia::render('master/roles/edit', [
                'role' => new RolesResource($role),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', $e->getMessage());
        }
    }

    public function update(UpdateRoleRequest $request, Roles $role): RedirectResponse
    {
        try {
            $this->checkPermission(request());
            $role->update($request->all());

            return redirect()->route('master.roles')->with('success', 'Role updated successfully');
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', $e->getMessage());
        }
    }

    public function destroy(DeleteRoleRequest $request, Roles $role): RedirectResponse
    {
        try {
            $this->checkPermission(request());
            $role->delete();

            return redirect()->route('master.roles')->with('success', 'Role deleted successfully');
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', $e->getMessage());
        }
    }
}
