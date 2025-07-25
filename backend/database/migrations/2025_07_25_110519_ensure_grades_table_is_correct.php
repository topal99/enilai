<?php
// File: database/migrations/xxxx_ensure_grades_table_is_correct.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            // Pastikan kolom-kolom ini ada dan terhubung dengan benar
            if (!Schema::hasColumn('grades', 'teacher_id')) {
                $table->foreignId('teacher_id')->constrained('users')->after('id');
            }
            if (!Schema::hasColumn('grades', 'student_id')) {
                // Catatan: Ini terhubung ke tabel student_profiles, BUKAN users
                $table->foreignId('student_id')->constrained('student_profiles')->after('teacher_id');
            }
            if (!Schema::hasColumn('grades', 'subject_id')) {
                $table->foreignId('subject_id')->constrained('subjects')->after('student_id');
            }
            if (!Schema::hasColumn('grades', 'semester_id')) {
                $table->foreignId('semester_id')->constrained('semesters')->after('score');
            }
        });
    }

    public function down(): void {} // Kita tidak perlu rollback untuk migrasi pengecekan ini
};