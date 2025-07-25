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
        // Tambahkan kolom semester setelah score
        $table->string('semester')->nullable()->after('score');
    });
}

public function down(): void
{
    Schema::table('grades', function (Blueprint $table) {
        $table->dropColumn('semester');
    });
}
};
