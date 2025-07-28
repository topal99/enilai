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
use App\Http\Controllers\Api\Homeroom\WalikelasController; 
use App\Http\Controllers\Api\Student\StudentController; 

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
    Route::get('/classes-all', [ClassController::class, 'getAllClasses']);
    Route::get('/subjects-all', [SubjectController::class, 'getAllSubjects']);
    

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
        Route::get('/classes-all', [ClassController::class, 'getAllClasses']);
        Route::get('/subjects-all', [SubjectController::class, 'getAllSubjects']);
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
        Route::get('/grades', [TeacherController::class, 'getGrades']); 
        Route::post('/ai-recommendation', [TeacherController::class, 'getAiRecommendation']); 
        Route::post('/settings/change-password', [SettingsController::class, 'changePassword']);
        Route::post('/grades/export', [TeacherController::class, 'exportGrades']); 
        Route::post('/attendances/bulk-store', [TeacherController::class, 'bulkStoreAttendances']); 
        Route::get('/attendances', [TeacherController::class, 'getAttendances']); // <-- TAMBAHKAN INI
        Route::get('/attendances/summary', [TeacherController::class, 'getAttendanceSummary']); // <-- TAMBAHKAN INI
        Route::get('/attendance/status', [TeacherController::class, 'getAttendanceStatus']); // <-- TAMBAHKAN INI
    });

    Route::middleware('role:walikelas')->prefix('homeroom')->group(function () {
        Route::get('/dashboard-summary', [WalikelasController::class, 'dashboardSummary']);
        Route::get('/student/{student}/report', [WalikelasController::class, 'getStudentReport']);
        Route::post('/report/generate-comment', [WalikelasController::class, 'generateAiComment']);

    });

    Route::middleware('role:murid')->prefix('student')->group(function () {
        Route::get('/dashboard-summary', [StudentController::class, 'dashboardSummary']);
        Route::get('/grades', [StudentController::class, 'getGrades']);
        Route::get('/subjects-with-grades', [StudentController::class, 'getSubjectsWithGrades']); // <-- TAMBAHKAN INI

    });

});