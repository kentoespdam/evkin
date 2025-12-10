<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\RoleResource;
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
        $users = User::with('role:id,name')
            ->paginate($request->per_page ?? 10);
        if ($request->has('search')) {
            $users = User::with('role:id,name')
                ->where('name', 'like', "%{$request->get('search')}%")
                ->paginate($request->per_page ?? 10);
        }

        return Inertia::render('master/users/index', [
            'page' => $users->toResourceCollection(),
        ]);
    }

    public function add(): Response
    {
        $roles = Roles::all();

        return Inertia::render('master/users/input', [
            'roles' => RoleResource::collection($roles),
        ]);
    }

    public function store(UpdateUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        User::create($data);

        return redirect()
            ->route('master.users')
            ->with('success', 'User created successfully');
    }

    public function edit(User $user): Response
    {
        $roles = Roles::all();

        return Inertia::render('master/users/edit', [
            'user' => new UserResource($user->load('role:id,name')),
            'roles' => RoleResource::collection($roles),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        // Only update password if provided
        if (empty($data['password'])) {
            unset($data['password']);
        }

        // Remove password_confirmation from data
        unset($data['password_confirmation']);

        $user->update($data);

        return redirect()
            ->route('master.users')
            ->with('success', 'User updated successfully');
    }
}
