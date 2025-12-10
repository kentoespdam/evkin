<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
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

    // public function edit(User $user): Response
    // {
    //     return Inertia::render('master/users/edit', [
    //         'user' => new UserResource($user->load('role:id,name')),
    //     ]);
    // }

    // public function edit(User $user): Response
    // {
    //     return Inertia::render('master/users/edit', [
    //         'user' => new UserResource($user->load('role:id,name')),
    //     ]);
    // }

    // public function destroy(User $user): \Illuminate\Http\RedirectResponse
    // {
    //     $user->delete();

    //     return redirect()->route('master.users')
    //         ->with('success', 'User deleted successfully.');
    // }
}
