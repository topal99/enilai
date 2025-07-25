<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // <-- PERBAIKAN DI SINI
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;
    
    protected $guarded = []; // Izinkan mass assignment

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}