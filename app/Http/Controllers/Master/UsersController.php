<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\CommonDeleteRequest;
use App\Http\Requests\Master\Users\CreateUserRequest;
use App\Http\Requests\Master\Users\UpdateUserRequest;
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
        $users = User::with('role:id,name')
            ->paginate($request->per_page ?? 10);
        if ($request->has('search')) {
            $users = User::with('role:id,name')
                ->where('name', 'like', "%{$request->get('search')}%")
                ->orWhere('email', 'like', "%{$request->get('search')}%")
                ->orWhereHas('role', function ($query) use ($request) {
                    $query->where('name', 'like', "%{$request->get('search')}%");
                })
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
            'roles' => RolesResource::collection($roles),
        ]);
    }

    public function store(CreateUserRequest $request): RedirectResponse
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
        $roles = Roles::all();

        return Inertia::render('master/users/edit', [
            'user' => new UserResource($user->load('role:id,name')),
            'roles' => RolesResource::collection($roles),
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

    public function destroy(CommonDeleteRequest $request, User $user): RedirectResponse
    {
        $user->delete();

        return redirect()
            ->route('master.users')
            ->with('success', 'User deleted successfully');
    }
}
