<?php
use App\Http\Controllers\Auth\HrAuthController;
use Illuminate\Support\Facades\Route;

Route::post('/hr/login', [HrAuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/hr/logout', [HrAuthController::class, 'logout']);
});