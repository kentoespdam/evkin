<?php

namespace App\Http\Middleware;

use App\Helpers\RoleHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! RoleHelper::isAdmin()) {
            return back()->with('error', 'Akses admin diperlukan.');
        }

        return $next($request);
    }
}
