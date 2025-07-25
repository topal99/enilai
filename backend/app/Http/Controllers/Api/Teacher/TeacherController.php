<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\GradeType;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TeacherController extends Controller
{
    public function dashboardSummary()
    {
        $teacher = Auth::user()->load(['subjects', 'teachingClasses']);

        // Ambil ID semester aktif dari settings
        $activeSemesterSetting = Setting::where('key', 'active_semester_id')->first();
        $activeSemesterId = $activeSemesterSetting ? $activeSemesterSetting->value : null;

        if (!$activeSemesterId) {
            return response()->json(['message' => 'Semester aktif belum diatur oleh Admin.'], 404);
        }
        
        $activeSemesterName = \App\Models\Semester::find($activeSemesterId)?->name ?? 'Tidak Ditemukan';

        // 1. Statistik Jumlah Mata Pelajaran
        $subjectsTaught = $teacher->subjects()->count();

        // 2. Statistik Rata-rata Nilai
        $averageScore = Grade::where('teacher_id', $teacher->id)
                            ->where('semester_id', $activeSemesterId)
                            ->avg('score');

        // 3. Statistik Total Murid yang Diajar
        $totalStudents = DB::table('student_profiles')
            ->whereIn('class_model_id', function ($query) use ($teacher) {
                $query->select('class_model_id')
                    ->from('class_teacher')
                    ->where('user_id', $teacher->id);
            })->distinct()->count('user_id');

        // 4. Top 3 Murid Berprestasi
        $topStudents = Grade::with('studentProfile.user:id,name') // KOREKSI: Gunakan relasi yang benar
            ->where('teacher_id', $teacher->id)
            ->where('semester_id', $activeSemesterId)
            ->select('student_id', DB::raw('AVG(score) as average_score'))
            ->groupBy('student_id')
            ->orderByDesc('average_score')
            ->take(3)
            ->get();
            
        return response()->json([
            'active_semester_name' => $activeSemesterName,
            'stats' => [
                'subjects_taught' => $teacher->subjects->count(),
                'total_students' => $totalStudents,
                'average_score' => number_format((float)$averageScore, 2),
            ],
            'top_students' => $topStudents,
            // PASTIKAN BAGIAN INI ADA DI DALAM RESPON ANDA
            'details' => [
                'subjects' => $teacher->subjects,
                'classes' => $teacher->teachingClasses,
            ]
        ]);

    }

    public function getGradeInputData()
    {
        $teacher = Auth::user();
        
        $classes = $teacher->teachingClasses()->orderBy('level')->orderBy('name')->get();
        $subjects = $teacher->subjects()->get();
        $gradeTypes = GradeType::all();

        return response()->json([
            'classes' => $classes,
            'subjects' => $subjects,
            'grade_types' => $gradeTypes,
        ]);
    }

    // Method untuk mengambil daftar murid berdasarkan kelas
    public function getStudentsByClass(Request $request)
    {
        $request->validate(['class_id' => 'required|exists:class_models,id']);
        
        $students = User::with('studentProfile')
            ->whereHas('studentProfile', function ($query) use ($request) {
                $query->where('class_model_id', $request->class_id);
            })->orderBy('name')->get(['id', 'name']);
            
        return response()->json($students);
    }

    // Method untuk menyimpan nilai secara massal
    public function bulkStoreGrades(Request $request)
    {
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'subject_id' => 'required|exists:subjects,id',
            'grade_type_id' => 'required|exists:grade_types,id',
            'exam_date' => 'required|date',
            'grades' => 'required|array|min:1',
            'grades.*.student_id' => 'required|exists:users,id',
            'grades.*.score' => 'required|numeric|min:0|max:100',
        ]);

        $teacherId = Auth::id();

        foreach ($validated['grades'] as $gradeData) {
            $studentProfile = User::find($gradeData['student_id'])->studentProfile;
            
            if ($studentProfile) {
                Grade::updateOrCreate(
                    [
                        'teacher_id' => $teacherId,
                        'student_id' => $studentProfile->id,
                        'subject_id' => $validated['subject_id'],
                        'semester_id' => $validated['semester_id'],
                        'grade_type_id' => $validated['grade_type_id'],
                    ],
                    [
                        'score' => $gradeData['score'],
                        'exam_date' => $validated['exam_date'],
                    ]
                );
            }
        }
        return response()->json(['message' => 'Semua nilai berhasil disimpan.']);
    }

    public function getGrades(Request $request)
    {
        $teacher = Auth::user();
        $activeSemesterId = Setting::where('key', 'active_semester_id')->first()?->value;

        if (!$activeSemesterId) {
            return response()->json(['data' => []]);
        }

        $query = Grade::with([
            'studentProfile.user:id,name', 
            'studentProfile.classModel:id,level,name',
            'subject:id,name',
            'gradeType:id,name'
        ])
        ->where('teacher_id', $teacher->id)
        ->where('semester_id', $activeSemesterId);

        $query->when($request->filled('class_id'), function ($q) use ($request) {
            return $q->whereHas('studentProfile', function ($sp) use ($request) {
                $sp->where('class_model_id', $request->class_id);
            });
        });

        $query->when($request->filled('subject_id'), function ($q) use ($request) {
            return $q->where('subject_id', $request->subject_id);
        });

        $query->when($request->filled('grade_type_id'), function ($q) use ($request) {
            return $q->where('grade_type_id', $request->grade_type_id);
        });

        $query->when($request->filled('exam_date'), function ($q) use ($request) {
            return $q->where('exam_date', $request->exam_date);
        });

        $grades = $query->latest('exam_date')->paginate(15);

        return $grades;

    }

    public function getAiRecommendation(Request $request)
    {
        $validated = $request->validate([
            'assignment_file' => 'required|file|mimes:txt,pdf,docx|max:2048', // Batasi tipe & ukuran file
            'criteria' => 'required|string|max:1000',
        ]);

        try {
            // Baca konten file (contoh sederhana untuk file .txt)
            $fileContent = file_get_contents($validated['assignment_file']->getRealPath());

            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                return response()->json(['message' => 'API Key untuk layanan AI belum diatur.'], 500);
            }

            // Buat prompt untuk AI
            $prompt = "Anda adalah asisten penilai akademik. Berdasarkan kriteria penilaian dan konten tugas berikut, berikan rekomendasi nilai dalam format JSON.\n\n" .
                      "Kriteria Penilaian:\n" . $validated['criteria'] . "\n\n" .
                      "Konten Tugas Murid:\n" . $fileContent . "\n\n" .
                      "Format JSON yang harus Anda kembalikan adalah: {\"recommended_score\": Angka (0-100), \"reasoning\": [\"poin alasan 1\", \"poin alasan 2\", \"poin alasan 3\"]}";
            
            // Panggil API Google Gemini
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ]);

            if ($response->failed()) {
                Log::error('AI API request failed', ['response' => $response->body()]);
                return response()->json(['message' => 'Gagal berkomunikasi dengan layanan AI.'], 500);
            }

            // Ekstrak teks dari respons AI
            $aiTextResponse = $response->json('candidates.0.content.parts.0.text');
            // Bersihkan teks untuk memastikan itu adalah JSON yang valid
            $jsonText = trim(str_replace(['```json', '```'], '', $aiTextResponse));
            $aiResult = json_decode($jsonText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                 Log::error('Failed to decode AI JSON response', ['raw_text' => $jsonText]);
                return response()->json(['message' => 'Gagal memproses respons dari AI.'], 500);
            }

            return response()->json($aiResult);

        } catch (\Exception $e) {
            Log::error('AI Recommendation Error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan internal pada server.'], 500);
        }
    }




}