<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Urutan ini penting
        $this->call([
            RoleSeeder::class,
            GradeTypeSeeder::class,
            DummyDataSeeder::class,
        ]);
    }
}
