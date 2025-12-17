<?php

namespace App\Http\Middleware;

use App\Helpers\RoleHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  string  $roles  Comma separated role IDs
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $roleIds = array_map('intval', explode(',', $roles));

        if (! RoleHelper::hasRole($roleIds)) {
            abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}
