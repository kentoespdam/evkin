<?php

namespace App\Helpers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class RoleHelper
{
    /**
     * Cek apakah user memiliki role tertentu
     *
     * @param  int|array  $roleIds  ID role atau array of role IDs
     */
    public static function hasRole($roleIds): bool
    {
        $user = Auth::user();

        if (! $user) {
            return false;
        }

        if (is_array($roleIds)) {
            return in_array($user->role_id, $roleIds);
        }

        return $user->role_id == $roleIds;
    }

    /**
     * Cek apakah user adalah admin (role_id = 1)
     */
    public static function isAdmin(): bool
    {
        return self::hasRole(1);
    }

    /**
     * Redirect jika tidak memiliki role tertentu
     *
     * @param  int|array  $roleIds
     */
    public static function redirectIfNotRole($roleIds): ?RedirectResponse
    {
        if (! self::hasRole($roleIds)) {
            return back()->with('error', 'Anda tidak memiliki akses ke halaman ini.');
        }

        return null;
    }

    /**
     * Redirect jika bukan admin
     */
    public static function redirectIfNotAdmin(): ?RedirectResponse
    {
        return self::redirectIfNotRole(1);
    }

    /**
     * Middleware-style: Authorize role dengan abort 403
     *
     * @param  int|array  $roleIds
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public static function authorizeRole($roleIds): void
    {
        if (! self::hasRole($roleIds)) {
            abort(403, 'Unauthorized access.');
        }
    }

    /**
     * Middleware-style: Authorize admin dengan abort 403
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public static function authorizeAdmin(): void
    {
        self::authorizeRole(1);
    }
}
