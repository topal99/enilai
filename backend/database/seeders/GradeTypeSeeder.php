<?php
// File: database/seeders/GradeTypeSeeder.php
namespace Database\Seeders;

use App\Models\GradeType;
use Illuminate\Database\Seeder;

class GradeTypeSeeder extends Seeder
{
    public function run(): void
    {
        GradeType::create(['name' => 'Tugas']);
        GradeType::create(['name' => 'Ulangan Harian']);
        GradeType::create(['name' => 'Ujian Tengah Semester (UTS)']);
        GradeType::create(['name' => 'Ujian Akhir Semester (UAS)']);
    }
}