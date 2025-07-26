<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;


class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil ID dari setiap peran
        $adminRole = Role::where('name', 'admin')->first();
        $guruRole = Role::where('name', 'guru')->first();
        $walikelasRole = Role::where('name', 'walikelas')->first();
        $muridRole = Role::where('name', 'murid')->first();

        // Buat Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
        ]);

        // Buat Wali Kelas
        User::create([
            'name' => 'Wali Kelas User',
            'email' => 'walikelas@gmail.com',
            'password' => Hash::make('password'),
            'role_id' => $walikelasRole->id,
        ]);
    }
}