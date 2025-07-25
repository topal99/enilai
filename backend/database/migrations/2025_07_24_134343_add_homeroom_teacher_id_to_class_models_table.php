<?php
// File: database/migrations/xxxx_add_homeroom_teacher_id_to_class_models_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_models', function (Blueprint $table) {
            // Tambahkan kolom untuk ID wali kelas, bisa null jika kelas belum punya wali kelas
            $table->foreignId('homeroom_teacher_id')->nullable()->after('name')
                  ->constrained('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('class_models', function (Blueprint $table) {
            $table->dropForeign(['homeroom_teacher_id']);
            $table->dropColumn('homeroom_teacher_id');
        });
    }
};