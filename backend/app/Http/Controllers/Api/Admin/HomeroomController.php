<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\ClassModel;

class HomeroomController extends Controller
{
    public function index(Request $request) // <-- Tambahkan Request $request
    {
        $query = User::with('homeroomClasses')
            ->whereHas('role', function ($query) {
                $query->where('name', 'walikelas');
            });
        
        // KOREKSI: Tambahkan logika pencarian
        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }

        $homerooms = $query->latest()->paginate(10);
        
        return $homerooms;
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'class_ids' => 'sometimes|array|max:3',
            'class_ids.*' => 'exists:class_models,id',
        ]);

        $walikelasRole = Role::where('name', 'walikelas')->firstOrFail();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $walikelasRole->id,
        ]);
        
        if (!empty($validated['class_ids'])) {
            ClassModel::whereIn('id', $validated['class_ids'])->update(['homeroom_teacher_id' => $user->id]);
        }
        
        return response()->json($user->load('homeroomClasses'), 201);
    }


    public function update(Request $request, User $homeroom)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($homeroom->id)],
            'password' => 'nullable|string|min:8',
            'class_ids' => 'sometimes|array|max:3',
            'class_ids.*' => 'exists:class_models,id',
        ]);

        $homeroom->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (!empty($validated['password'])) {
            $homeroom->update(['password' => Hash::make($validated['password'])]);
        }
        
        $newClassIds = $validated['class_ids'] ?? [];
        // 1. Lepaskan semua kelas yang saat ini diampu oleh wali kelas ini
        ClassModel::where('homeroom_teacher_id', $homeroom->id)->update(['homeroom_teacher_id' => null]);
        // 2. Tugaskan kelas-kelas yang baru dipilih
        ClassModel::whereIn('id', $newClassIds)->update(['homeroom_teacher_id' => $homeroom->id]);

        return response()->json($homeroom->load('homeroomClasses'));
    }

    /**
     * KOREKSI: Ubah nama variabel $user menjadi $homeroom.
     */
    public function destroy(User $homeroom)
    {
        // Pencegahan agar tidak bisa menghapus diri sendiri jika suatu saat admin juga wali kelas
        if (auth()->id() === $homeroom->id) {
             return response()->json(['message' => 'Anda tidak dapat menghapus akun Anda sendiri.'], 403);
        }

        $homeroom->delete();
        return response()->json(['message' => 'Wali kelas berhasil dihapus.']);
    }
}
