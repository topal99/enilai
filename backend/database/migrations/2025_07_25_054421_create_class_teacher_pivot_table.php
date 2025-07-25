<?php
// File: database/migrations/xxxx_create_class_teacher_pivot_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('class_teacher', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // ID Guru
            $table->foreignId('class_model_id')->constrained()->onDelete('cascade'); // ID Kelas
            $table->primary(['user_id', 'class_model_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('class_teacher'); }
};