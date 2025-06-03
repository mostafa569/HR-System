<?php

namespace App\Http\Controllers\Department;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    /** Display a paginated listing of departments. */
    public function index()
    {
        $departments = Department::paginate(10);
        return response()->json($departments);
    }

    /** Store a newly created department. */
    public function store(Request $request)
    {
        $request->validate([
            'name' => [
                'required', 'string', 'max:255', Rule::unique('departments', 'name'),
            ],
        ]);

        $department = Department::create(['name' => $request->name]);

        return response()->json(['message' => 'Department created successfully.', 'department' => $department], 201);
    }

    /** Display the specified department. */
    public function show(Department $department)
    {
        return response()->json(['department' => $department]);
    }

    /** Update the specified department. */
    public function update(Request $request, Department $department)
    {
        $request->validate([
            'name' => [
                'required', 'string', 'max:255', Rule::unique('departments', 'name')->ignore($department->id),
            ],
        ]);

        $department->update(['name' => $request->name]);

        return response()->json(['message' => 'Department updated successfully.', 'department' => $department]);
    }

    /** Remove the specified department. */
   public function destroy($id)
{
    $department = Department::find($id);

    if (!$department) {
        return response()->json(['message' => 'Department not found.'], 404);
    }


    $department->delete();

    return response()->json(['message' => 'Department deleted successfully.']);
}

}