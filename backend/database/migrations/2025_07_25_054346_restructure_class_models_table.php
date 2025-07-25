<?php
// File: database/migrations/xxxx_restructure_class_models_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('class_models', function (Blueprint $table) {
            $table->dropColumn('name'); // Hapus kolom nama lama
            $table->integer('level')->after('id'); // Kolom untuk tingkat: 7, 8, 9
            $table->string('name')->after('level'); // Kolom untuk abjad: A, B, C
            $table->unique(['level', 'name']); // Pastikan tidak ada duplikat (misal: 7-A tidak bisa ada 2x)
        });
    }
    public function down(): void {
        Schema::table('class_models', function (Blueprint $table) {
            $table->dropUnique(['level', 'name']);
            $table->dropColumn(['level', 'name']);
            $table->string('name')->unique();
        });
    }
};