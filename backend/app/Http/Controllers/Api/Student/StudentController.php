<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    public function dashboardSummary()
    {
        $student = Auth::user();
        $studentProfile = $student->studentProfile;

        // Jika siswa tidak punya profil (belum dimasukkan ke kelas), kembalikan data kosong
        if (!$studentProfile) {
            return response()->json(['message' => 'Profil siswa tidak ditemukan.'], 404);
        }

        $activeSemesterId = Setting::where('key', 'active_semester_id')->first()?->value;

        if (!$activeSemesterId) {
            return response()->json(['message' => 'Semester aktif belum diatur.'], 404);
        }

        // 1. Ambil 3 nilai terbaru
        $recentGrades = Grade::with(['subject:id,name', 'gradeType:id,name'])
            ->where('student_id', $studentProfile->id)
            ->where('semester_id', $activeSemesterId)
            ->latest('exam_date')
            ->take(3)
            ->get();

        // 2. Hitung rata-rata semua nilai di semester ini
        $averageScore = Grade::where('student_id', $studentProfile->id)
                             ->where('semester_id', $activeSemesterId)
                             ->avg('score');

        return response()->json([
            'recent_grades' => $recentGrades,
            'average_score' => number_format((float)$averageScore, 2),
        ]);
    }

     public function getGrades(Request $request)
    {
        $studentProfile = Auth::user()->studentProfile;
        $activeSemesterId = Setting::where('key', 'active_semester_id')->first()?->value;

        if (!$studentProfile || !$activeSemesterId) {
            return response()->json(['data' => []]); // Kembalikan data kosong jika ada yang tidak beres
        }

        $grades = Grade::with([
            'subject:id,name',
            'gradeType:id,name',
            'teacher:id,name' // Ambil nama guru yang menginput nilai
        ])
        ->where('student_id', $studentProfile->id)
        ->where('semester_id', $activeSemesterId)
        ->latest('exam_date')
        ->paginate(15); // Gunakan paginasi

        return $grades;
    }
}