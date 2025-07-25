<?php

namespace App\Providers;

use App\Models\User; // <-- 1. Impor model User
use App\Observers\UserObserver; // <-- 2. Impor UserObserver
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 3. Daftarkan Observer di sini
        User::observe(UserObserver::class);
    }
}