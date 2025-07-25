<?php
// File: database/migrations/xxxx_drop_class_homeroom_teacher_pivot_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Hapus tabel pivot yang sudah tidak kita gunakan
        Schema::dropIfExists('class_homeroom_teacher');
    }

    public function down(): void
    {
        // Jika di-rollback, buat kembali (opsional tapi praktik yang baik)
        Schema::create('class_homeroom_teacher', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_model_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'class_model_id']);
        });
    }
};