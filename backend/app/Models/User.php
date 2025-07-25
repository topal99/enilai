<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// KOREKSI: Impor kelas relasi dari namespace yang benar
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- Impor

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'profile_picture_url',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relasi ke Role
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    // Relasi ke StudentProfile
    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }
    
    // Relasi ke Subject
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'subject_user', 'user_id', 'subject_id');
    }

    public function homeroomClasses(): HasMany
    {
        // Seorang wali kelas bisa memiliki BANYAK kelas
        return $this->hasMany(ClassModel::class, 'homeroom_teacher_id');
    }

    public function teachingClasses(): BelongsToMany
    {
        // Seorang guru bisa mengajar di BANYAK kelas
        return $this->belongsToMany(ClassModel::class, 'class_teacher', 'user_id', 'class_model_id');
    }

}