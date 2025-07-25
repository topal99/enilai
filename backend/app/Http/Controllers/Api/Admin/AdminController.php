<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Grade;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use App\Models\Role; // KOREKSI 1: Menambahkan impor kelas Role
use App\Models\StudentProfile; // KOREKSI 2: Mengganti Student dengan StudentProfile

class AdminController extends Controller
{
    // Method dashboardSummary() sudah benar, tidak ada perubahan.
    public function dashboardSummary()
    {
        $stats = [
            'total_users' => User::count(),
            'total_teachers' => User::whereHas('role', function ($query) {
                $query->whereIn('name', ['guru', 'walikelas']);
            })->count(),
            'total_students' => User::whereHas('role', function ($query) {
                $query->where('name', 'murid');
            })->count(),
            'total_grades' => Grade::count(),
        ];
        $user_composition = DB::table('users')
                            ->join('roles', 'users.role_id', '=', 'roles.id')
                            ->select('roles.name as role', DB::raw('count(users.id) as total'))
                            ->groupBy('roles.name')
                            ->get();
        $recent_activities = ActivityLog::with('user:id,name')->latest()->take(5)->get();
        return response()->json([
            'stats' => $stats,
            'user_composition' => $user_composition,
            'recent_activities' => $recent_activities,
        ]);
    }

    // Method index() sudah benar, tidak ada perubahan.
    public function index(Request $request)
    {
        $query = User::with('role')->whereHas('role', function ($query) {
            $query->where('name', 'admin');
        });
        
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }
        // if ($request->has('role_id') && $request->role_id != '') {
        //     $query->where('role_id', $request->role_id);
        // }
        return $query->latest()->paginate(10);
    }

    /**
     * Menyimpan pengguna baru.
     */
    public function store(Request $request)
    {
        // KOREKSI: Ambil role_name dari request untuk digunakan di validasi
        $roleName = Role::find($request->role_id)?->name;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            // Validasi kondisional
            'class_model_id' => 'required_if:role_name,murid|exists:class_models,id',
            'subject_ids' => 'required_if:role_name,guru|array|min:1|max:2',
            'subject_ids.*' => 'exists:subjects,id',
            // KOREKSI: Tambahkan validasi untuk kelas yang diajar guru
            'class_ids' => 'sometimes|array',
            'class_ids.*' => 'exists:class_models,id',
        ], [], [
            // Kirim 'role_name' agar 'required_if' bisa bekerja
            'role_name' => $roleName
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
        ]);

        if ($roleName === 'murid') {
            StudentProfile::create([
                'user_id' => $user->id,
                'class_model_id' => $validated['class_model_id'],
            ]);
        }
        // KOREKSI: Gunakan variabel $roleName yang benar
        if ($roleName === 'guru') {
            $user->subjects()->attach($validated['subject_ids']);
            // Tambahkan logika untuk melampirkan kelas yang diajar
            if (!empty($validated['class_ids'])) {
                $user->teachingClasses()->attach($validated['class_ids']);
            }
        }

        return response()->json($user->load(['role', 'subjects', 'studentProfile', 'teachingClasses']), 201);
    }

    /**
     * Mengupdate pengguna yang sudah ada.
     */
    public function update(Request $request, User $user)
    {
        $roleName = Role::find($request->role_id)?->name;

        // KOREKSI: Gabungkan semua validasi menjadi SATU blok
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'class_model_id' => 'required_if:role_name,murid|exists:class_models,id',
            'subject_ids' => 'required_if:role_name,guru|array|min:1|max:2',
            'subject_ids.*' => 'exists:subjects,id',
            'class_ids' => 'sometimes|array',
            'class_ids.*' => 'exists:class_models,id',
        ], [], [
            'role_name' => $roleName
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        if ($roleName === 'murid') {
            StudentProfile::updateOrCreate(
                ['user_id' => $user->id],
                ['class_model_id' => $validated['class_model_id']]
            );
            $user->subjects()->detach();
            $user->teachingClasses()->detach(); // Pastikan data lama guru bersih
        } else if ($roleName === 'guru') {
            $user->subjects()->sync($validated['subject_ids']);
            $user->teachingClasses()->sync($validated['class_ids'] ?? []); // Gunakan sync untuk update
            $user->studentProfile()->delete();
        } 

        else {
            // Jika admin atau peran lain, hapus semua data peran spesifik
            $user->subjects()->detach();
            $user->teachingClasses()->detach();
            $user->studentProfile()->delete();
        }

        return response()->json($user->load(['role', 'subjects', 'studentProfile', 'teachingClasses']));
    }

    
        // PENYEMPURNAAN 2: Menambahkan method show() untuk kelengkapan apiResource
    public function show(User $user)
    {
        return $user->load(['role', 'subjects', 'studentProfile']);
    }

    // Method destroy() sudah benar, tidak ada perubahan.
    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Anda tidak dapat menghapus akun Anda sendiri.'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'Pengguna berhasil dihapus.']);
    }

    /**
     * Menampilkan daftar semua log aktivitas dengan paginasi.
     */
    public function getActivityLogs(Request $request)
    {
        $logs = ActivityLog::with('user:id,name')->latest()->paginate(15);
        return $logs;
    }

    public function getStudentsByClass(Request $request)
    {
        $request->validate(['class_id' => 'required|exists:class_models,id']);

        // KOREKSI: Gunakan with() untuk menyertakan data profil dan kelas pada setiap murid
        $students = User::with(['studentProfile.classModel'])
            ->whereHas('studentProfile', function ($query) use ($request) {
                $query->where('class_model_id', $request->class_id);
            })->get();

        return response()->json($students);
    }


    public function getTeachers(Request $request)
    {
        $query = User::with('subjects', 'teachingClasses') // Eager load relasi subjects
            ->whereHas('role', function ($query) {
                // Filter hanya untuk peran 'guru' atau 'walikelas'
                $query->whereIn('name', ['guru',]);
            });

        // Tambahkan fungsionalitas pencarian jika perlu
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where('name', 'like', "%{$searchTerm}%");
        }

        return $query->latest()->paginate(10);
    }

}