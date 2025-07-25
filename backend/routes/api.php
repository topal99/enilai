<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\Admin\SemesterController;
use App\Http\Controllers\Api\Admin\SubjectController;
use App\Http\Controllers\Api\Admin\ClassController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\Admin\HomeroomController; 
use App\Http\Controllers\Api\Teacher\TeacherController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rute publik (tidak perlu login)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rute yang dilindungi (harus login)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Rute untuk data master
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/settings', [SettingsController::class, 'getSettings']);
    Route::post('/settings/change-password', [SettingsController::class, 'changePassword']);

    // ===================================
    // GRUP RUTE KHUSUS ADMIN
    // ===================================
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard-summary', [AdminController::class, 'dashboardSummary']);
        Route::get('/activity-logs', [AdminController::class, 'getActivityLogs']);
        Route::post('/settings', [SettingsController::class, 'updateSettings']);
        
        // Rute untuk halaman kelola guru & murid
        Route::get('/teachers', [AdminController::class, 'getTeachers']);
        Route::get('/students-by-class', [AdminController::class, 'getStudentsByClass']);
        Route::get('/classes-all', [ClassController::class, 'getAllClasses']); // <-- TAMBAHKAN INI
        Route::get('/subjects-all', [SubjectController::class, 'getAllSubjects']); // <-- TAMBAHKAN INI
        Route::get('/homeroom-available-classes', [ClassController::class, 'getAvailableHomeroomClasses']);

        // Rute CRUD menggunakan apiResource
        Route::apiResource('users', AdminController::class);
        Route::apiResource('semesters', SemesterController::class)->only(['index', 'store']);
        Route::apiResource('subjects', SubjectController::class);
        Route::apiResource('classes', ClassController::class);
        Route::apiResource('homerooms', HomeroomController::class);
    });

    // ===================================
    // GRUP RUTE KHUSUS GURU
    // ===================================
    Route::middleware('role:guru')->prefix('teacher')->group(function () {
        Route::get('/dashboard-summary', [TeacherController::class, 'dashboardSummary']);
        Route::get('/grade-input-data', [TeacherController::class, 'getGradeInputData']);
        Route::get('/students-by-class', [TeacherController::class, 'getStudentsByClass']);
        Route::post('/grades/bulk-store', [TeacherController::class, 'bulkStoreGrades']);
        Route::get('/grades', [TeacherController::class, 'getGrades']); // <-- TAMBAHKAN INI

    });

});