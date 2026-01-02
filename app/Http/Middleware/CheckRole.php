<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Helpers\RoleHelper;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roles): RedirectResponse|Response
    {
        $roleIds = array_map('intval', explode(',', $roles));

        if (!RoleHelper::hasRole($roleIds)) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
