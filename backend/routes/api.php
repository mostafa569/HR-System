<?php
use App\Http\Controllers\Holiday\HolidayController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\HrAuthController;
use App\Http\Controllers\Employer\EmployerController;
use App\Http\Controllers\Department\DepartmentController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Hr\HrController;
use App\Http\Controllers\SalarySummary\SalarySummaryController;
use App\Http\Controllers\Adjustment\AdjustmentController;

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

    // Salary Management
    Route::prefix('salary')->group(function () {
        Route::get('/', [SalarySummaryController::class, 'index']);
        Route::post('/calculate', [SalarySummaryController::class, 'calculate']);
        Route::get('/summary/{employerId}', [SalarySummaryController::class, 'getSalarySummary']);
    });

    // Dashboard Routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/stats', [DashboardController::class, 'getDashboardStats']);
        Route::get('/employers', [DashboardController::class, 'getAllEmployers']);
        Route::get('/attendance-today', [DashboardController::class, 'getTodayAttendance']);
        Route::get('/upcoming-holidays', [DashboardController::class, 'getUpcomingHolidays']);
    });

    // Adjustment Routes
    Route::get('/employers/{employerId}/adjustments', [AdjustmentController::class, 'index']);
    Route::post('/adjustments', [AdjustmentController::class, 'store']);
    Route::get('/adjustments/{id}', [AdjustmentController::class, 'show']);
    Route::put('/adjustments/{id}', [AdjustmentController::class, 'update']);
    Route::delete('/adjustments/{id}', [AdjustmentController::class, 'destroy']);
    ;});
