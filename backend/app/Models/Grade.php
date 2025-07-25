<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;
    protected $guarded = [];

    /**
     * Relasi ke profil murid yang dinilai.
     * Menggunakan foreign key 'student_id' yang merujuk ke tabel 'student_profiles'.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    /**
     * Relasi ke guru yang memberi nilai.
     * Menggunakan foreign key 'teacher_id'.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * KOREKSI: Tambahkan relasi ke mata pelajaran.
     * Menggunakan foreign key 'subject_id'.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * KOREKSI: Tambahkan relasi ke jenis nilai/ujian.
     * Menggunakan foreign key 'grade_type_id'.
     */
    public function gradeType(): BelongsTo
    {
        return $this->belongsTo(GradeType::class);
    }
}