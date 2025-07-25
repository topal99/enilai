<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    // File: app/Http/Middleware/RoleMiddleware.php
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Ambil user yang sedang login
        $user = Auth::user();

        // 1. Cek apakah user ada dan memiliki relasi 'role'
        //    Gunakan ->load('role') untuk memastikan relasi dimuat jika belum ada.
        if (!$user || !$user->load('role')->role) {
            return response()->json(['message' => 'Akses ditolak. Peran tidak ditemukan.'], 403);
        }

        // 2. Cek apakah nama peran user ada di dalam daftar peran yang diizinkan
        if (!in_array($user->role->name, $roles)) {
            return response()->json(['message' => 'Akses ditolak. Anda tidak memiliki izin yang sesuai.'], 403);
        }

        // 3. Jika semua pengecekan lolos, lanjutkan request
        return $next($request);
    }
  

}
