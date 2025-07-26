<?php
// File: database/migrations/xxxx_create_attendances_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->onDelete('cascade');
            $table->foreignId('class_model_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('semester_id')->constrained('semesters')->onDelete('cascade');
            $table->date('attendance_date');
            $table->enum('status', ['hadir', 'sakit', 'izin', 'alpa']);
            $table->string('notes')->nullable();
            $table->timestamps();

            // Unique index HANYA berdasarkan murid, tanggal, dan kelas
            $table->unique(
                ['student_id', 'attendance_date', 'class_model_id'],
                'daily_attendance_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};