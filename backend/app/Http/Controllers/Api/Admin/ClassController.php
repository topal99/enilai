<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassModel;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule; // <-- Jangan lupa impor ini

class ClassController extends Controller
{
    /**
     * Menampilkan daftar semua kelas dengan paginasi.
     */
    public function index()
    {
        return ClassModel::latest()->paginate(10);
    }

    /**
     * Menyimpan kelas baru ke dalam database.
     */
    public function store(Request $request) {
        // PENYEMPURNAAN: Pengecekan duplikasi dimasukkan ke dalam validasi
        $validated = $request->validate([
            'level' => 'required|integer|in:7,8,9',
            'name' => [
                'required',
                'string',
                'max:255',
                // Cek kombinasi 'level' dan 'name' harus unik di tabel 'class_models'
                Rule::unique('class_models')->where('level', $request->level)
            ],
        ]);
        
        $class = ClassModel::create($validated);
        return response()->json($class, 201);
    }


    /**
     * Menampilkan detail satu kelas.
     */
    public function show(ClassModel $class)
    {
        return response()->json($class);
    }

    /**
     * Mengupdate data kelas yang sudah ada.
     */
    public function update(Request $request, ClassModel $class)
    {
        // KOREKSI: Validasi diubah total agar sesuai skema baru
        $validated = $request->validate([
            'level' => 'required|integer|in:7,8,9',
            'name' => [
                'required',
                'string',
                'max:255',
                // Cek kombinasi 'level' dan 'name' harus unik,
                // tapi abaikan untuk ID kelas yang sedang diedit.
                Rule::unique('class_models')->where('level', $request->level)->ignore($class->id)
            ],
        ]);

        $class->update($validated);

        return response()->json($class);
    }

    /**
     * Menghapus kelas dari database.
     */
    public function destroy(ClassModel $class)
    {
        // Anda bisa menambahkan logika pengecekan di sini,
        // misalnya jangan hapus kelas jika masih ada murid atau guru yang terhubung.
        $class->delete();

        return response()->json(['message' => 'Kelas berhasil dihapus.']);
    }

    /**
     * Mengambil semua data kelas tanpa paginasi (untuk dropdown).
     */
    public function getAllClasses(Request $request)
    {
        $query = ClassModel::query();

        // Ambil hanya kelas yang belum punya wali kelas
        $query->whereNull('homeroom_teacher_id');

        // Jika sedang mengedit, sertakan juga kelas yang sudah diampu oleh wali kelas tersebut
        if ($request->has('editing_user_id')) {
            $query->orWhere('homeroom_teacher_id', $request->editing_user_id);
        }
        
        return $query->latest()->get();
    }

    
}