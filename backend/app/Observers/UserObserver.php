<?php

namespace App\Observers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        ActivityLog::create([
            'user_id' => Auth::id() ?? $user->id, // Jika dibuat oleh sistem (seeder), gunakan id user itu sendiri
            'activity' => "Pengguna baru '{$user->name}' dengan peran '{$user->role->name}' telah ditambahkan.",
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'activity' => "Data pengguna '{$user->name}' telah diperbarui.",
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'activity' => "Pengguna '{$user->name}' telah dihapus dari sistem.",
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        // Opsional: jika Anda menggunakan soft deletes
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        // Opsional: jika Anda menggunakan soft deletes
    }
}