<?php

namespace App\Http\Controllers\Api\Homeroom;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClassModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Grade;
use App\Models\Setting;
use App\Models\Semester;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; // <-- TAMBAHKAN BARIS INI

class WalikelasController extends Controller
{
    public function dashboardSummary()
    {
        $homeroomTeacher = Auth::user();

        // Cari kelas yang diampu oleh wali kelas ini
        $class = ClassModel::where('homeroom_teacher_id', $homeroomTeacher->id)->first();

        if (!$class) {
            // Jika wali kelas ini tidak mengampu kelas manapun
            return response()->json([
                'class_name' => 'Tidak mengampu kelas',
                'student_count' => 0,
                'students' => [],
            ]);
        }

        // Ambil semua murid dari kelas tersebut
        $students = User::whereHas('studentProfile', function ($query) use ($class) {
            $query->where('class_model_id', $class->id);
        })->orderBy('name')->get(['id', 'name']);
        
        return response()->json([
            'class_name' => $class->level . '-' . $class->name,
            'student_count' => $students->count(),
            'students' => $students,
        ]);
    }

        /**
     * Mengambil data nilai lengkap seorang siswa untuk rapor.
     */
    public function getStudentReport(User $student)
    {
        // Cukup panggil sekali di sini
        $homeroomTeacher = Auth::user();

        if (!$student->studentProfile) {
            return response()->json([
                'message' => 'Data profil untuk siswa ini tidak lengkap atau tidak ditemukan.'
            ], 404);
        }
        
        // Hapus baris '$homeroomTeacher = Auth::user();' yang ada di sini sebelumnya

        $class = ClassModel::where('homeroom_teacher_id', $homeroomTeacher->id)->first();
        if (!$class || $student->studentProfile->class_model_id !== $class->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke rapor siswa ini.'], 403);
        }

        // Sisa kode di bawah ini sudah sempurna
        $activeSemesterId = Setting::where('key', 'active_semester_id')->first()?->value;
        
        $grades = Grade::with(['subject:id,name', 'gradeType:id,name'])
            ->where('student_id', $student->studentProfile->id)
            ->where('semester_id', $activeSemesterId)
            ->select('score', 'exam_date', 'subject_id', 'grade_type_id') // <-- Pilih kolom yang dibutuhkan
            ->orderBy('subject_id')
            ->get();
        
        $reportData = $grades->groupBy('subject.name')->map(function ($subjectGrades) {
            $totalScore = $subjectGrades->sum('score');
            $average = $totalScore > 0 ? $totalScore / $subjectGrades->count() : 0;
            return ['grades' => $subjectGrades, 'average' => round($average, 2)];
        });

        $attendanceSummary = $student->studentProfile->attendances()
            ->where('semester_id', $activeSemesterId)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')->get()->pluck('total', 'status');

        return response()->json([
            'student' => $student->only('id', 'name'),
            'class' => $class->level . '-' . $class->name,
            'semester' => Semester::find($activeSemesterId)?->name,
            'report_data' => $reportData,
            'attendance_summary' => [
                'hadir' => $attendanceSummary->get('hadir', 0),
                'sakit' => $attendanceSummary->get('sakit', 0),
                'izin' => $attendanceSummary->get('izin', 0),
                'alpa' => $attendanceSummary->get('alpa', 0),
            ]
        ]);
    }

    /**
     * Menghasilkan komentar rapor menggunakan AI.
     */
    public function generateAiComment(Request $request)
    {
        $validated = $request->validate([
            'student_name' => 'required|string',
            'grade_summary' => 'required|string',
        ]);

        $prompt = "Anda adalah seorang wali kelas yang bijaksana dan suportif di Indonesia. Buatlah sebuah catatan rapor untuk siswa bernama '{$validated['student_name']}' berdasarkan ringkasan nilai berikut:\n\n{$validated['grade_summary']}\n\n" .
                  "Berikan respons dalam format JSON HANYA dengan struktur berikut: {\"summary\":\"(Ringkasan umum singkat)\", \"strengths\":\"(Satu kalimat tentang kekuatan utama siswa)\", \"areas_for_improvement\":\"(Satu kalimat tentang area yang perlu ditingkatkan)\", \"recommendation\":\"(Satu kalimat rekomendasi konkret)\"}. Gunakan bahasa Indonesia yang formal namun memotivasi.";

        // Panggil helper AI
        $aiResult = $this->callGeminiApi($prompt);

        if (!$aiResult) {
            return response()->json(['message' => 'Gagal mendapatkan respons valid dari layanan AI.'], 500);
        }

        return response()->json($aiResult);
    }

    /**
     * PENAMBAHAN BARU:
     * Method pribadi yang berisi logika pemanggilan AI yang sudah terbukti berhasil.
     * Kita tiru dari TeacherController.
     */
    private function callGeminiApi(string $prompt)
    {
        try {
            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                Log::error('GEMINI_API_KEY not set in .env file.');
                return null;
            }

            $response = Http::timeout(45)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [['parts' => [['text' => $prompt]]]]
            ]);

            if ($response->failed()) {
                Log::error('AI API request failed', ['status' => $response->status(), 'response' => $response->body()]);
                return null;
            }

            $aiTextResponse = data_get($response->json(), 'candidates.0.content.parts.0.text');
            if (!$aiTextResponse) {
                Log::error('Invalid AI response structure', ['response' => $response->json()]);
                return null;
            }

            $jsonText = trim(str_replace(['```json', '```'], '', $aiTextResponse));
            $aiResult = json_decode($jsonText, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Failed to decode AI JSON response', ['raw_text' => $jsonText]);
                return null;
            }

            return $aiResult;

        } catch (\Exception $e) {
            Log::error('AI API Call Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }



}