<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentProfile extends Model
{
    use HasFactory;

    /**
     * Menonaktifkan perlindungan mass assignment agar bisa diisi secara massal.
     * Ini aman untuk model sederhana seperti ini.
     */
    protected $guarded = [];

    /**
     * Mendefinisikan relasi "milik" ke model User.
     * Setiap profil siswa adalah milik satu pengguna.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mendefinisikan relasi "milik" ke model ClassModel.
     * Setiap profil siswa terhubung ke satu kelas.
     */
    public function classModel(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'student_id');
    }


    
}