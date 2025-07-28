<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\StudentProfile;
use App\Models\Subject; // Pastikan model Subject di-import
use Illuminate\Database\Eloquent\Collection;

class StudentController extends Controller
{
    /**
     * Menyediakan ringkasan data untuk dashboard siswa.
     */
    public function dashboardSummary()
    {
        $studentProfile = Auth::user()->studentProfile;
        $activeSemesterId = Setting::where('key', 'active_semester_id')->first()?->value;

        if (!$studentProfile || !$activeSemesterId) {
            return response()->json(['message' => 'Profil siswa atau semester aktif tidak ditemukan.'], 404);
        }

        // OPTIMASI: Ambil semua nilai di semester aktif dalam satu query.
        $allGrades = Grade::with(['subject:id,name', 'gradeType:id,name'])
            ->where('student_id', $studentProfile->id)
            ->where('semester_id', $activeSemesterId)
            ->latest('exam_date')
            ->get();

        // 1. Ambil 3 nilai terbaru dari koleksi yang sudah diambil.
        $recentGrades = $allGrades->take(3);

        // 2. Hitung rata-rata rapor (rata-rata dari rata-rata per mapel).
        $finalAverage = 0;
        if ($allGrades->isNotEmpty()) {
            // Kelompokkan nilai berdasarkan mapel, lalu hitung rata-rata per mapel.
            $subjectAverages = $allGrades->groupBy('subject_id')->map(function ($subjectGrades) {
                return $subjectGrades->avg('score');
            });
            // Hitung rata-rata dari semua rata-rata mapel tersebut.
            $finalAverage = $subjectAverages->avg();
        }

        return response()->json([
            'recent_grades' => $recentGrades,
            'average_score' => round($finalAverage, 2),
        ]);
    }

    /**
     * Mengambil daftar nilai siswa dengan filter dan statistik.
     */
    public function getGrades(Request $request)
    {
        $studentProfile = Auth::user()->studentProfile;
        $activeSemesterId = Setting::where('key', 'active_semester_id')->first()?->value;

        if (!$studentProfile || !$activeSemesterId) {
            return response()->json(['data' => []]);
        }

        $gradesQuery = Grade::where('student_id', $studentProfile->id)
            ->where('semester_id', $activeSemesterId);

        // Terapkan filter jika ada
        $gradesQuery->when($request->filled('subject_id'), function ($q) use ($request) {
            return $q->where('subject_id', $request->subject_id);
        });

        // OPTIMASI: Ambil koleksi untuk statistik dalam satu query.
        $gradesForStats = (clone $gradesQuery)->get(['score', 'subject_id']);
        
        $averageForStats = 0;
        if ($gradesForStats->isNotEmpty()) {
            // Jika difilter berdasarkan mapel, hitung rata-rata biasa untuk mapel tsb.
            if ($request->filled('subject_id')) {
                $averageForStats = $gradesForStats->avg('score');
            } else {
                // Jika tidak, hitung rata-rata rapor (rata-rata dari rata-rata per mapel).
                $subjectAverages = $gradesForStats->groupBy('subject_id')->map->avg('score');
                $averageForStats = $subjectAverages->avg();
            }
        }

        $stats = [
            'total'   => $gradesForStats->count(),
            'average' => round($averageForStats, 2),
            'highest' => $gradesForStats->max('score') ?? 0,
            'lowest'  => $gradesForStats->min('score') ?? 0,
        ];

        // Ambil data untuk paginasi
        $paginatedGrades = $gradesQuery->with([
            'subject:id,name',
            'gradeType:id,name',
            'teacher:id,name'
        ])->latest('exam_date')->paginate(15);
        
        $responseData = $paginatedGrades->toArray();
        $responseData['stats'] = $stats;

        return response()->json($responseData);
    }

    /**
     * Mengambil daftar mata pelajaran yang memiliki nilai.
     */
    public function getSubjectsWithGrades()
    {
        $studentProfile = Auth::user()->studentProfile;
        $activeSemesterId = Setting::where('key', 'active_semester_id')->first()?->value;

        if (!$studentProfile || !$activeSemesterId) {
            return response()->json([]);
        }

        $subjectIds = Grade::where('student_id', $studentProfile->id)
            ->where('semester_id', $activeSemesterId)
            ->distinct()
            ->pluck('subject_id');
            
        $subjects = Subject::whereIn('id', $subjectIds)->orderBy('name')->get(['id', 'name']);

        return response()->json($subjects);
    }
}