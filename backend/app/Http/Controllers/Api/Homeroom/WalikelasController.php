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
use Illuminate\Support\Facades\DB; 
use App\Models\StudentProfile;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StudentReportExport;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;


class WalikelasController extends Controller
{
    public function dashboardSummary()
    {
        $homeroomTeacher = Auth::user();
        $activeSemesterId = Setting::where('key', 'active_semester_id')->first()?->value;

        $class = ClassModel::where('homeroom_teacher_id', $homeroomTeacher->id)->first();

        if (!$class || !$activeSemesterId) {
            return response()->json([
                'class_name' => $class ? ($class->level . '-' . $class->name) : 'Tidak mengampu kelas',
                'student_count' => 0,
                'students' => [],
                'active_semester_name' => Semester::find($activeSemesterId)?->name,
                'stats' => ['average_scores_by_subject' => []]
            ]);
        }

        $studentProfileIds = StudentProfile::where('class_model_id', $class->id)->pluck('id');
        
        // Statistik rata-rata per mapel untuk chart (ini sudah benar)
        $averageScoresBySubject = [];
        if ($studentProfileIds->isNotEmpty()) {
            $averageScoresBySubject = Grade::with('subject:id,name')
                ->whereIn('student_id', $studentProfileIds)
                ->where('semester_id', $activeSemesterId)
                ->get()
                ->groupBy('subject.name')
                ->map(function ($subjectGrades) {
                    return round($subjectGrades->avg('score'), 2);
                });
        }
        
        // OPTIMASI: Ambil semua nilai (termasuk subject_id) untuk semua siswa di kelas
        $allGradesForClass = Grade::whereIn('student_id', $studentProfileIds)
            ->where('semester_id', $activeSemesterId)
            ->select('student_id', 'subject_id', 'score')
            ->get()
            ->groupBy('student_id');
        
        $students = User::whereHas('studentProfile', function ($query) use ($class) {
            $query->where('class_model_id', $class->id);
        })
        ->with('studentProfile:id,user_id')
        ->orderBy('name')->get(['id', 'name']);
        
        $students->each(function ($student) use ($activeSemesterId, $allGradesForClass) {
            $studentGrades = $allGradesForClass->get($student->studentProfile->id);

            if ($studentGrades && $studentGrades->isNotEmpty()) {
                // KOREKSI UTAMA: Hitung rata-rata dari rata-rata per mapel
                
                // 1. Kelompokkan nilai siswa berdasarkan mapel (subject_id)
                $gradesBySubject = $studentGrades->groupBy('subject_id');

                // 2. Hitung rata-rata untuk setiap mapel, hasilnya adalah koleksi berisi rata-rata per mapel.
                // Contoh: [Matematika => 85, B. Indonesia => 90]
                $subjectAverages = $gradesBySubject->map(function ($subjectGrades) {
                    $totalScore = $subjectGrades->sum('score');
                    $countGrades = $subjectGrades->count();
                    return $countGrades > 0 ? $totalScore / $countGrades : 0;
                });

                // 3. Hitung rata-rata dari koleksi rata-rata mapel di atas.
                // Contoh: (85 + 90) / 2 = 87.5
                $finalAverage = $subjectAverages->avg();
                
                $student->average_score = round($finalAverage, 2);

            } else {
                $student->average_score = 0;
            }

            // Logika absensi tetap sama
            $attendanceSummary = $student->studentProfile->attendances()
                ->where('semester_id', $activeSemesterId)
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')->get()->pluck('total', 'status');

            $student->attendance_percentage = round(
                ($attendanceSummary->get('hadir', 0) / ($attendanceSummary->sum() ?: 1)) * 100, 2
            );
        });
        
        return response()->json([
            'class_name' => $class->level . '-' . $class->name,
            'student_count' => $students->count(),
            'students' => $students,
            'active_semester_name' => Semester::find($activeSemesterId)?->name,
            'stats' => [
                'average_scores_by_subject' => $averageScoresBySubject,
            ]
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
            
        $perSubjectAverages = $reportData->pluck('average');
        $overallAverageScore = $perSubjectAverages->isNotEmpty() ? $perSubjectAverages->avg() : 0;

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'average_score' => number_format((float)$overallAverageScore, 2), // Sertakan di sini
            ],
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

    public function exportStudentReport(User $student)
    {
        // Panggil method getStudentReport untuk mendapatkan data JSON
        $reportJsonResponse = $this->getStudentReport($student);
        
        // Cek jika ada error (misal: akses ditolak)
        if ($reportJsonResponse->getStatusCode() !== 200) {
            return $reportJsonResponse; // Kembalikan respons error
        }

        // Ambil data dari respons JSON
        $reportData = json_decode($reportJsonResponse->getContent(), true);

        $studentInfo = [
            'name' => $reportData['student']['name'],
            'class' => $reportData['class'],
            'semester' => $reportData['semester'],
            'average_score' => $reportData['student']['average_score'],
        ];

        // Buat koleksi baru untuk isi tabel
        $gradesCollection = collect($reportData['report_data'])->map(function ($data, $subject) {
            return [
                'subject' => $subject,
                'average' => $data['average'],
            ];
        });
        
        $fileName = 'rapor_' . str_replace(' ', '_', strtolower($studentInfo['name'])) . '.xlsx';

        // Ganti implementasi export agar lebih sesuai
        $export = new class($gradesCollection, $studentInfo, $reportData['attendance_summary']) implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles {
            protected $collection, $studentInfo, $attendanceSummary;

            public function __construct($collection, $studentInfo, $attendanceSummary) {
                $this->collection = $collection;
                $this->studentInfo = $studentInfo;
                $this->attendanceSummary = $attendanceSummary;
            }
            public function collection() { return $this->collection; }
            public function headings(): array {
                return [
                    ['Rapor Akademik Siswa'],
                    ['Nama Siswa', $this->studentInfo['name']],
                    ['Kelas', $this->studentInfo['class']],
                    ['Semester', $this->studentInfo['semester']],
                    [' '],
                    ['Mata Pelajaran', 'Rata-rata Nilai'],
                ];
            }
            public function styles(Worksheet $sheet) {
                $sheet->mergeCells('A1:B1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
                $sheet->getStyle('A2:A4')->getFont()->setBold(true);
                $sheet->getStyle('A6:B6')->getFont()->setBold(true);
                $lastRow = count($this->collection) + 6;
                $sheet->getStyle('A6:B' . $lastRow)->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                $attStartRow = $lastRow + 2;
                $sheet->setCellValue('A' . $attStartRow, 'Rekap Absensi')->getStyle('A' . $attStartRow)->getFont()->setBold(true);
                $sheet->setCellValue('A' . ($attStartRow + 1), 'Hadir')->setCellValue('B' . ($attStartRow + 1), $this->attendanceSummary['hadir']);
                $sheet->setCellValue('A' . ($attStartRow + 2), 'Sakit')->setCellValue('B' . ($attStartRow + 2), $this->attendanceSummary['sakit']);
                $sheet->setCellValue('A' . ($attStartRow + 3), 'Izin')->setCellValue('B' . ($attStartRow + 3), $this->attendanceSummary['izin']);
                $sheet->setCellValue('A' . ($attStartRow + 4), 'Alpa')->setCellValue('B' . ($attStartRow + 4), $this->attendanceSummary['alpa']);
                $avgScoreStartRow = $attStartRow + 6; 
                $sheet->setCellValue('A' . $avgScoreStartRow, 'Rata-rata Keseluruhan')->getStyle('A' . $avgScoreStartRow)->getFont()->setBold(true);
                $sheet->setCellValue('B' . $avgScoreStartRow, $this->studentInfo['average_score'])->getStyle('B' . $avgScoreStartRow)->getFont()->setBold(true);

            }
        };

        return Excel::download($export, $fileName);
    }




}