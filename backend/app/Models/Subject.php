<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{
    use HasFactory;
    
    /**
     * Menonaktifkan perlindungan mass assignment.
     */
    protected $guarded = [];

    /**
     * Relasi many-to-many ke model User (guru).
     */
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'subject_user');
    }
}