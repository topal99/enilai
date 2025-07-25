<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Fungsi untuk Registrasi User Baru
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:admin,guru,walikelas,murid'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user
        ], 201);
    }

    // Fungsi untuk Login User
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Coba otentikasi user
        if (!Auth::attempt($request->only('email', 'password'))) {
            // Jika gagal, kirim response error
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        // Jika berhasil, ambil data user
        $user = User::with('role')->where('email', $request['email'])->firstOrFail();

        // Buat token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Kirim response berisi token dan data user
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    // Fungsi untuk Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out']);
    }

    // Fungsi untuk mengambil data user yang sedang login
    public function user(Request $request)
    {
        return $request->user();
    }
}