<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\UsersRequest;
use App\Http\Resources\RolesResource;
use App\Http\Resources\UserResource;
use App\Models\Master\Roles;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->per_page ?? 10;

        $query = User::with('role:id,name');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('role', function ($roleQuery) use ($search) {
                        $roleQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $users = $query->paginate($perPage);

        return Inertia::render('master/users/index', [
            'page' => $users->toResourceCollection(),
        ]);
    }

    public function add(): Response
    {
        $roles = Roles::all();

        return Inertia::render('master/users/add', [
            'roles' => RolesResource::collection($roles),
        ]);
    }

    public function store(UsersRequest $request): RedirectResponse
    {
        $data = $request->validated();
        unset($data['password_confirmation']);
        User::create($data);

        return redirect()
            ->route('master.users')
            ->with('success', 'User created successfully');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('master/users/edit', [
            'user' => new UserResource($user->load('role:id,name')),
            'roles' => RolesResource::collection(Roles::all()),
        ]);
    }

    public function update(UsersRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }
        unset($data['password_confirmation']);
        $user->update($data);

        return redirect()
            ->route('master.users')
            ->with('success', 'User updated successfully');
    }

    public function destroy(CommonDeleteRequest $request, User $user): RedirectResponse
    {
        $user->delete();

        return redirect()
            ->route('master.users')
            ->with('success', 'User deleted successfully');
    }
}
