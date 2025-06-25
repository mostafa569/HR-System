<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller; 
use App\Models\Attendance;
use App\Models\Employer;
use App\Models\Department;
use App\Models\Holiday;
use App\Models\Adjustment;
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

        if (
            isset($validated['attendance_time']) &&
            isset($validated['leave_time']) &&
            Carbon::createFromFormat('H:i', $validated['attendance_time'])
                ->greaterThanOrEqualTo(Carbon::createFromFormat('H:i', $validated['leave_time']))
        ) {
            return response()->json(['message' => 'Attendance time must be before leave time'], 400);
        }

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

    public function attendEmployer(Request $request, $id)
    {
        $employer = Employer::find($id);
        if (!$employer) {
            return response()->json(['message' => 'Employer not found'], 404);
        }
    
        $today = Carbon::today('Africa/Cairo');
    
         
        $holiday = Holiday::where('date', $today)->first();
        if ($holiday) {
            return response()->json([
                'message' => 'Cannot mark attendance on a holiday',
                'holiday_name' => $holiday->name,
                'holiday_type' => $holiday->type
            ], 400);
        }
    
         
        $attendance = Attendance::where('employer_id', $id)
            ->whereDate('date', $today)
            ->first();
    
        if (!$attendance) {
            $attendance = new Attendance();
            $attendance->employer_id = $id;
            $attendance->department_id = $employer->department_id;
            $attendance->date = $today;
        }
    
        $attendanceTimeStr = $request->input('attendance_time');
        if ($attendanceTimeStr) {
            $attendanceTime = Carbon::createFromFormat('H:i', $attendanceTimeStr, 'Africa/Cairo');
        } else {
            $attendanceTime = Carbon::now('Africa/Cairo');
            $attendanceTimeStr = $attendanceTime->format('H:i');
        }
        $scheduledLeaveTime = Carbon::createFromTimeString($employer->leave_time, 'Africa/Cairo');
    
        if ($attendanceTime->greaterThan($scheduledLeaveTime)) {
            return response()->json(['message' => 'Cannot mark attendance after scheduled leave time'], 400);
        }
    
        $attendance->attendance_time = $attendanceTimeStr;
        $attendance->save();
    
        $adjustmentMessage = '';
        if ($request->input('apply_adjustment', true)) {
            $recordedTime = $attendanceTime;
            $scheduledTime = Carbon::createFromTimeString($employer->attendance_time, 'Africa/Cairo');
    
            if ($recordedTime->gt($scheduledTime)) {
                $minutesLate = $recordedTime->diffInMinutes($scheduledTime);
                $hours = abs(round($minutesLate / 60, 2));
                Adjustment::create([
                    'employer_id' => $id,
                    'date' => $today,
                    'value' => $hours,
                    'value_type' => 'hours',
                    'kind' => 'deduction',
                    'reason' => 'Late arrival'
                ]);
                $adjustmentMessage = "Deducted {$hours} hours for late arrival";
            } elseif ($recordedTime->lt($scheduledTime)) {
                $minutesEarly = $scheduledTime->diffInMinutes($recordedTime);
                $hours = abs(round($minutesEarly / 60, 2));
                Adjustment::create([
                    'employer_id' => $id,
                    'date' => $today,
                    'value' => $hours,
                    'value_type' => 'hours',
                    'kind' => 'addition',
                    'reason' => 'Early arrival overtime'
                ]);
                $adjustmentMessage = "Added {$hours} hours for early arrival";
            }
        }
    
        return response()->json([
            'message' => 'Attendance recorded. '.$adjustmentMessage,
            'data' => $attendance
        ]);
    }
    
    public function leaveEmployer(Request $request, $id)
    {
        $employer = Employer::find($id);
        if (!$employer) {
            return response()->json(['message' => 'Employer not found'], 404);
        }
    
        $today = Carbon::today('Africa/Cairo');
    
        $holiday = Holiday::where('date', $today)->first();
        if ($holiday) {
            return response()->json([
                'message' => 'Cannot mark leave on a holiday',
                'holiday_name' => $holiday->name,
                'holiday_type' => $holiday->type
            ], 400);
        }
    
        $attendance = Attendance::where('employer_id', $id)
            ->whereDate('date', $today)
            ->first();
    
        if (!$attendance || !$attendance->attendance_time) {
            return response()->json(['message' => 'Attendance not marked yet'], 400);
        }
    
        if ($attendance->leave_time) {
            return response()->json(['message' => 'Leave already marked'], 400);
        }
    
        $leaveTimeStr = $request->input('leave_time');
        if ($leaveTimeStr) {
            $leaveTime = Carbon::createFromFormat('H:i', $leaveTimeStr, 'Africa/Cairo');
        } else {
            $leaveTime = Carbon::now('Africa/Cairo');
            $leaveTimeStr = $leaveTime->format('H:i');
        }
        $attendance->leave_time = $leaveTimeStr;
        $attendance->save();
    
        $adjustmentMessage = '';
        if ($request->input('apply_adjustment', true)) {
            $recordedLeave = $leaveTime;
            $scheduledLeave = Carbon::createFromTimeString($employer->leave_time, 'Africa/Cairo');
    
            if ($recordedLeave->gt($scheduledLeave)) {
                $minutesLate = $recordedLeave->diffInMinutes($scheduledLeave);
                $hours = abs(round($minutesLate / 60, 2));
                Adjustment::create([
                    'employer_id' => $id,
                    'date' => $today,
                    'value' => $hours,
                    'value_type' => 'hours',
                    'kind' => 'addition',
                    'reason' => 'Overtime work'
                ]);
                $adjustmentMessage = "Added {$hours} hours for overtime";
            } elseif ($recordedLeave->lt($scheduledLeave)) {
                $minutesEarly = $scheduledLeave->diffInMinutes($recordedLeave);
                $hours = abs(round($minutesEarly / 60, 2));
                Adjustment::create([
                    'employer_id' => $id,
                    'date' => $today,
                    'value' => $hours,  
                    'value_type' => 'hours',
                    'kind' => 'deduction',
                    'reason' => 'Early departure'
                ]);
                $adjustmentMessage = "Deducted {$hours} hours for early leave";
            }
        }
    
        return response()->json([
            'message' => 'Leave time recorded. '.$adjustmentMessage,
            'data' => $attendance
        ]);
    }

  
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

        if (
            isset($validated['attendance_time']) &&
            isset($validated['leave_time']) &&
            Carbon::createFromFormat('H:i', $validated['attendance_time'])
                ->greaterThanOrEqualTo(Carbon::createFromFormat('H:i', $validated['leave_time']))
        ) {
            return response()->json(['message' => 'Attendance time must be before leave time'], 400);
        }

       
        if (isset($validated['date'])) {
            $holiday = Holiday::where('date', $validated['date'])->first();
            if ($holiday) {
                return response()->json([
                    'message' => 'Cannot update attendance on a holiday',
                    'holiday_name' => $holiday->name,
                    'holiday_type' => $holiday->type
                ], 400);
            }
        }

       
        $oldAttendanceTime = $attendance->attendance_time;
        $oldLeaveTime = $attendance->leave_time;
        $oldDate = $attendance->date;

        
        $attendance->update($validated);

        $adjustmentMessage = '';
        $applyAdjustment = $request->input('apply_adjustment', true);

        if ($applyAdjustment) {
            $employer = Employer::find($attendance->employer_id);
            
           
            if (isset($validated['attendance_time']) && $employer) {
                $recordedTime = Carbon::createFromTimeString($validated['attendance_time'], 'Africa/Cairo');
                $scheduledTime = Carbon::createFromTimeString($employer->attendance_time, 'Africa/Cairo');
                $attendanceDate = isset($validated['date']) ? $validated['date'] : $oldDate;

             
                Adjustment::where('employer_id', $attendance->employer_id)
                    ->where('date', $attendanceDate)
                    ->whereIn('reason', ['Late arrival', 'Early arrival overtime'])
                    ->delete();

                if ($recordedTime->gt($scheduledTime)) {
                    $minutesLate = $recordedTime->diffInMinutes($scheduledTime);
                    $hours = abs(round($minutesLate / 60, 2));
                    Adjustment::create([
                        'employer_id' => $attendance->employer_id,
                        'date' => $attendanceDate,
                        'value' => $hours,
                        'value_type' => 'hours',
                        'kind' => 'deduction',
                        'reason' => 'Late arrival'
                    ]);
                    $adjustmentMessage .= "Deducted {$hours} hours for late arrival. ";
                } elseif ($recordedTime->lt($scheduledTime)) {
                    $minutesEarly = $scheduledTime->diffInMinutes($recordedTime);
                    $hours = abs(round($minutesEarly / 60, 2));
                    Adjustment::create([
                        'employer_id' => $attendance->employer_id,
                        'date' => $attendanceDate,
                        'value' => $hours,
                        'value_type' => 'hours',
                        'kind' => 'addition',
                        'reason' => 'Early arrival overtime'
                    ]);
                    $adjustmentMessage .= "Added {$hours} hours for early arrival. ";
                }
            }

          
            if (isset($validated['leave_time']) && $employer) {
                $recordedLeave = Carbon::createFromTimeString($validated['leave_time'], 'Africa/Cairo');
                $scheduledLeave = Carbon::createFromTimeString($employer->leave_time, 'Africa/Cairo');
                $attendanceDate = isset($validated['date']) ? $validated['date'] : $oldDate;

          
                Adjustment::where('employer_id', $attendance->employer_id)
                    ->where('date', $attendanceDate)
                    ->whereIn('reason', ['Overtime work', 'Early departure'])
                    ->delete();

                if ($recordedLeave->gt($scheduledLeave)) {
                    $minutesLate = $recordedLeave->diffInMinutes($scheduledLeave);
                    $hours = abs(round($minutesLate / 60, 2));
                    Adjustment::create([
                        'employer_id' => $attendance->employer_id,
                        'date' => $attendanceDate,
                        'value' => $hours,
                        'value_type' => 'hours',
                        'kind' => 'addition',
                        'reason' => 'Overtime work'
                    ]);
                    $adjustmentMessage .= "Added {$hours} hours for overtime. ";
                } elseif ($recordedLeave->lt($scheduledLeave)) {
                    $minutesEarly = $scheduledLeave->diffInMinutes($recordedLeave);
                    $hours = abs(round($minutesEarly / 60, 2));
                    Adjustment::create([
                        'employer_id' => $attendance->employer_id,
                        'date' => $attendanceDate,
                        'value' => $hours,
                        'value_type' => 'hours',
                        'kind' => 'deduction',
                        'reason' => 'Early departure'
                    ]);
                    $adjustmentMessage .= "Deducted {$hours} hours for early leave. ";
                }
            }
        }

        return response()->json([
            'message' => 'Attendance record updated successfully. ' . $adjustmentMessage,
            'data' => $attendance
        ]);
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