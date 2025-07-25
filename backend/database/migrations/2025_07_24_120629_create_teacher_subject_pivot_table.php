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
        // Tabel ini tidak butuh ID atau timestamps.
        // Namanya mengikuti konvensi Laravel: subject_user (model singular, urut abjad)
        Schema::create('subject_user', function (Blueprint $table) {
            // Kolom untuk ID guru, terhubung ke tabel 'users'
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Kolom untuk ID mapel, terhubung ke tabel 'subjects'
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            
            // Menjadikan kombinasi user_id dan subject_id sebagai primary key
            // untuk mencegah seorang guru diajarkan mapel yang sama dua kali.
            $table->primary(['user_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subject_user');
    }
};