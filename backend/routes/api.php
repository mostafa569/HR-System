<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\HrAuthController;
use App\Http\Controllers\Employer\EmployerController;
use App\Http\Controllers\Department\DepartmentController;

Route::post('/hr/login', [HrAuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
Route::apiResource('employers', EmployerController::class);
Route::post('employers/{id}/attend', [EmployerController::class, 'attendEmployer']);
Route::post('employers/{id}/leave', [EmployerController::class, 'leaveEmployer']);
Route::apiResource('departments', DepartmentController::class);
Route::post('/hr/logout', [HrAuthController::class, 'logout']);
   
Route::apiResource('departments', DepartmentController::class);
});