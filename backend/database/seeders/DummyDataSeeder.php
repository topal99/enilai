<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\User;
use App\Models\ClassModel;
use App\Models\Subject;
use App\Models\StudentProfile;
use App\Models\Semester;
use App\Models\Setting; 

class DummyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Ambil ID peran yang dibutuhkan
            $adminRole = Role::where('name', 'admin')->firstOrFail();
            $guruRole = Role::where('name', 'guru')->firstOrFail();
            $walikelasRole = Role::where('name', 'walikelas')->firstOrFail();
            $muridRole = Role::where('name', 'murid')->firstOrFail();

            $activeSemester = Semester::create(['name' => 'Ganjil 2025/2026']);
            $this->command->info('Semester "Ganjil 2025/2026" berhasil dibuat.');

            Setting::create([
                'key' => 'active_semester_id',
                'value' => $activeSemester->id,
            ]);
            $this->command->info('Semester aktif berhasil diatur.');

            // 2. Buat Kelas 7-A
            $class7A = ClassModel::create(['level' => 7, 'name' => 'A']);
            $this->command->info('Kelas 7-A berhasil dibuat.');

            // 3. Buat Mata Pelajaran
            $subjectIPA = Subject::create(['name' => 'IPA']);
            $subjectMTK = Subject::create(['name' => 'Matematika']);
            $this->command->info('Mapel IPA & Matematika berhasil dibuat.');
            
            // 4. Buat Admin
            User::create([
                'name' => 'Admin Utama',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
            ]);
            $this->command->info('Admin berhasil dibuat.');

            // 5. Buat Wali Kelas dan hubungkan dengan kelas 7-A
            $waliKelas7A = User::create([
                'name' => 'Rina Wali Kelas',
                'email' => 'walikelas.7a@gmail.com',
                'password' => Hash::make('password'),
                'role_id' => $walikelasRole->id,
            ]);
            // Ploting: Jadikan sebagai wali kelas untuk 7-A
            $class7A->homeroom_teacher_id = $waliKelas7A->id;
            $class7A->save();
            $this->command->info('Wali Kelas berhasil dibuat dan diplot ke 7-A.');


            // 6. Buat 2 Guru dan hubungkan dengan mapel & kelas
            // Guru IPA
            $guruIPA = User::create([
                'name' => 'Budi Guru IPA',
                'email' => 'guru.ipa@gmail.com',
                'password' => Hash::make('password'),
                'role_id' => $guruRole->id,
            ]);
            $guruIPA->subjects()->attach($subjectIPA->id);
            $guruIPA->teachingClasses()->attach($class7A->id);
            $this->command->info('Guru IPA berhasil dibuat dan diplot ke 7-A.');

            // Guru Matematika
            $guruMTK = User::create([
                'name' => 'Siti Guru MTK',
                'email' => 'guru.mtk@gmail.com',
                'password' => Hash::make('password'),
                'role_id' => $guruRole->id,
            ]);
            $guruMTK->subjects()->attach($subjectMTK->id);
            $guruMTK->teachingClasses()->attach($class7A->id);
            $this->command->info('Guru Matematika berhasil dibuat dan diplot ke 7-A.');

            // 7. Buat 10 Murid dan masukkan ke kelas 7-A
            $this->command->info('Membuat 10 murid...');
            for ($i = 1; $i <= 10; $i++) {
                $murid = User::create([
                    'name' => "Murid Ke-{$i}",
                    'email' => "murid{$i}@gmail.com",
                    'password' => Hash::make('password'),
                    'role_id' => $muridRole->id,
                ]);

                StudentProfile::create([
                    'user_id' => $murid->id,
                    'class_model_id' => $class7A->id,
                ]);
            }
            $this->command->info('10 murid berhasil dibuat dan dimasukkan ke kelas 7-A.');
        });
    }
}