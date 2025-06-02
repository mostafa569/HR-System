<?php

namespace App\Http\Controllers\Department;
use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::paginate(10);
        return response()->json($departments);
    }
}