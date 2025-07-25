<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    // Anda bisa menggunakan salah satu dari dua cara di bawah ini
    
    // Cara 1: (Lebih mudah dan umum untuk model sederhana)
    // Memberitahu Laravel bahwa tidak ada kolom yang dijaga.
    protected $guarded = [];

    // Cara 2: (Lebih eksplisit)
    // Memberitahu Laravel kolom mana saja yang BOLEH diisi.
    /*
    protected $fillable = [
        'user_id',
        'activity',
        'ip_address',
    ];
    */


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}