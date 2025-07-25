<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting; // Kita akan buat model ini
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\Semester; // <-- Impor Semester
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    /**
     * Mengambil semua pengaturan.
     */
    public function getSettings()
    {
        $settingsRaw = Setting::all()->pluck('value', 'key');
        
        $activeSemesterId = $settingsRaw->get('active_semester_id');
        $activeSemester = null;
        if ($activeSemesterId) {
            $semester = Semester::find($activeSemesterId);
            $activeSemester = $semester ? $semester->name : null;
        }

        return response()->json([
            'active_semester_id' => $activeSemesterId, // Kirim ID-nya
            'active_semester_name' => $activeSemester, // Kirim juga namanya
        ]);
    }

    public function updateSettings(Request $request)
    {
        // Validasi sekarang memeriksa ID semester
        $validated = $request->validate([
            'active_semester_id' => 'required|exists:semesters,id',
        ]);

        Setting::updateOrCreate(
            ['key' => 'active_semester_id'], // Simpan sebagai active_semester_id
            ['value' => $validated['active_semester_id']]
        );

        return response()->json(['message' => 'Pengaturan semester aktif berhasil diperbarui.']);
    }


    /**
     * Mengubah password pengguna yang sedang login.
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();
        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json(['message' => 'Password berhasil diubah.']);
    }
    
    //* Memperbarui profil (nama & email) pengguna yang sedang login.
    
    // public function updateProfile(Request $request)
    // {
    //     $user = Auth::user();

    //     $validated = $request->validate([
    //         'name' => 'required|string|max:255',
    //         // Pastikan email unik, tapi abaikan email milik user saat ini
    //         'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
    //     ]);

    //     $user->update($validated);

    //     // Kembalikan data user yang sudah diperbarui
    //     return response()->json($user);
    // }

}