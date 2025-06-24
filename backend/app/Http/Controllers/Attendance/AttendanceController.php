<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller; 
use App\Models\Attendance;
use App\Models\Employer;
use App\Models\Department;
use Carbon\Carbon;
use Illuminate\Http\Request;
 

class AttendanceController extends Controller
{
   
    public function index(Request $request)
    {
        $query = Attendance::with(['employer', 'department']);

        
        if ($request->has('employee_name') && !empty($request->input('employee_name'))) {
            $query->whereHas('employer', function ($q) use ($request) {
                $q->where('full_name', 'like', "%{$request->input('employee_name')}%");
            });
        }

        
        if ($request->has('department_id') && !empty($request->input('department_id'))) {
            $query->where('department_id', $request->input('department_id'));
        }

        
        if ($request->has('date') && !empty($request->input('date'))) {
            $query->whereDate('date', $request->input('date'));
        } elseif ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [
                $request->input('start_date'),
                $request->input('end_date')
            ]);
        }

        
        $sortBy = $request->input('sort_by', 'date');
        $sortDirection = $request->input('sort_direction', 'desc');
        $validSortFields = ['date', 'attendance_time', 'leave_time', 'employer_id'];
        if (in_array($sortBy, $validSortFields)) {
            if ($sortBy === 'employer_id') {
                $query->join('employers', 'attendances.employer_id', '=', 'employers.id')
                      ->orderBy('employers.full_name', $sortDirection)
                      ->select('attendances.*');
            } else {
                $query->orderBy($sortBy, $sortDirection);
            }
        }

        $perPage = $request->input('per_page', 10);
        $attendances = $query->paginate($perPage);

        return response()->json([
            'data' => $attendances->items(),
            'total' => $attendances->total(),
            'current_page' => $attendances->currentPage(),
            'last_page' => $attendances->lastPage(),
        ]);
    }

   
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employer_id' => 'required|exists:employers,id',
            'date' => 'required|date',
            'attendance_time' => 'required|date_format:H:i',
            'leave_time' => 'nullable|date_format:H:i',
        ]);

        $existingAttendance = Attendance::where('employer_id', $validated['employer_id'])
            ->where('date', $validated['date'])
            ->first();

        if ($existingAttendance) {
            return response()->json(['message' => 'Attendance already recorded for this date'], 400);
        }

        $attendance = Attendance::create([
            'employer_id' => $validated['employer_id'],
            'department_id' => Employer::find($validated['employer_id'])->department_id,
            'date' => $validated['date'],
            'attendance_time' => $validated['attendance_time'],
            'leave_time' => $validated['leave_time'],
        ]);

return response()->json(['message' => 'Attendance record added successfully', 'data' => $attendance], 201);    }

  
    public function update(Request $request, $id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }

        $validated = $request->validate([
            'employer_id' => 'sometimes|required|exists:employers,id',
            'date' => 'sometimes|required|date',
            'attendance_time' => 'sometimes|required|date_format:H:i',
            'leave_time' => 'nullable|date_format:H:i',
        ]);

        $attendance->update($validated);

        return response()->json($attendance);
    }

    
    public function destroy($id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }

        $attendance->delete();

        return response()->json(['message' => 'Attendance record deleted successfully']);
    }


}