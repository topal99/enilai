<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            // Tambahkan kolom grade_type_id setelah subject_id
            // Kolom ini terhubung ke tabel grade_types
            $table->foreignId('grade_type_id')
                  ->nullable()
                  ->after('subject_id')
                  ->constrained('grade_types')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropForeign(['grade_type_id']);
            $table->dropColumn('grade_type_id');
        });
    }
};