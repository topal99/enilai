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
    // Panggil RoleSeeder terlebih dahulu
    $this->call(RoleSeeder::class);
    // Baru kemudian panggil UserSeeder
    $this->call(UserSeeder::class);
}

}
