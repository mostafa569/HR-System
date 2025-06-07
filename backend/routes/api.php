<?php
use App\Http\Controllers\Holiday\HolidayController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\HrAuthController;
use App\Http\Controllers\Employer\EmployerController;
use App\Http\Controllers\Department\DepartmentController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Hr\HrController;

// Public routes
Route::post('/hr/login', [HrAuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // HR Management
    Route::post('/hr/logout', [HrAuthController::class, 'logout']);
    Route::apiResource('hrs', HrController::class);
    
    // Employer Management
    Route::apiResource('employers', EmployerController::class);
    Route::post('employers/{id}/attend', [EmployerController::class, 'attendEmployer']);
    Route::post('employers/{id}/leave', [EmployerController::class, 'leaveEmployer']);
    
    // Department Management
    Route::apiResource('departments', DepartmentController::class);
    
    // Holiday Management
    Route::apiResource('holidays', HolidayController::class);
    
    // Dashboard Routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/stats', [DashboardController::class, 'getDashboardStats']);
        Route::get('/employers', [DashboardController::class, 'getAllEmployers']);
        Route::get('/attendance-today', [DashboardController::class, 'getTodayAttendance']);
        Route::get('/upcoming-holidays', [DashboardController::class, 'getUpcomingHolidays']);
    });
});