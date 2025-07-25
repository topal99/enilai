<?php
// File: app/Http/Controllers/Api/Admin/SemesterController.php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    // Mengambil semua semester, diurutkan dari yang terbaru
    public function index()
    {
        return Semester::latest()->get();
    }

    // Menyimpan semester baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:semesters',
        ]);
        $semester = Semester::create($validated);
        return response()->json($semester, 201);
    }
}