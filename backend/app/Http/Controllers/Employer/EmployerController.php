<?php

namespace App\Http\Controllers\Employer;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App\Models\Employer;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Adjustment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployerController extends Controller
{
    
      public function index(Request $request)
    {
         
        $query = Employer::with('department');

         
        if ($request->has('search') && !empty($request->input('search'))) {
            $search = $request->input('search');
            $searchFields = explode(',', $request->input('search_fields', 'full_name,national_id,phone'));

            $query->where(function ($q) use ($search, $searchFields) {
                if (in_array('full_name', $searchFields)) {
                    $q->orWhere('full_name', 'like', "%{$search}%");
                }
                if (in_array('national_id', $searchFields)) {
                    $q->orWhere('national_id', 'like', "%{$search}%");
                }
                if (in_array('phone', $searchFields)) {
                    $q->orWhere('phone', 'like', "%{$search}%");
                }
            });
        }

        
        if ($request->has('department_name') && !empty($request->input('department_name'))) {
            $query->whereHas('department', function ($q) use ($request) {
                $q->where('name', $request->input('department_name'));
            });
        }

         
        $sortBy = $request->input('sort_by', 'full_name');
        $sortDirection = $request->input('sort_direction', 'asc');

        
        $validSortFields = ['full_name', 'national_id', 'phone', 'salary', 'department'];
        if (in_array($sortBy, $validSortFields)) {
            if ($sortBy === 'department') {
                $query->join('departments', 'employers.department_id', '=', 'departments.id')
                      ->orderBy('departments.name', $sortDirection)
                      ->select('employers.*');  
            } else {
                $query->orderBy($sortBy, $sortDirection);
            }
        }

         
        $perPage = 10;
        $employers = $query->paginate($perPage);

         
        return response()->json([
            'data' => $employers->items(),
            'total' => $employers->total(),
            'current_page' => $employers->currentPage(),
            'last_page' => $employers->lastPage(),
        ]);
    }

    
    public function show($id)
    {
        $employer = Employer::with('department')->find($id);

        if (!$employer) {
            return response()->json(['message' => 'Employer not found'], 404);
        }

        return response()->json($employer);
    }

   
    public function store(Request $request)
    {
       $validated = $request->validate([
    'full_name' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s]+$/'],
    'gender' => ['required', Rule::in(['male', 'female', 'other'])],
    'nationality' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s]+$/'],
    'dob' => ['required', 'date', 'before_or_equal:today'],
    'national_id' => ['required', 'string', 'min:5', 'max:20', 'regex:/^[0-9]+$/', 'unique:employers,national_id'],
    'address' => 'required|string',
    'phone' => ['required', 'string', 'regex:/^01[0125][0-9]{8}$/', 'unique:employers,phone'],
    'department_id' => 'required|exists:departments,id',
    'contract_date' => 'required|date',
    'salary' => 'required|numeric',
    'attendance_time' => 'required|date_format:H:i',
    'leave_time' => 'required|date_format:H:i',
], [
    'full_name.regex' => 'Name must contain only English letters without numbers or special characters',
    'nationality.regex' => 'Nationality must contain only English letters without numbers or special characters',
    'dob.before_or_equal' => 'Date of birth cannot be in the future',
    'phone.regex' => 'Invalid phone number. Must start with 01 followed by 0, 1, 2, or 5 and then 8 digits',
    'phone.unique' => 'This phone number is already registered',
    'national_id.regex' => 'National ID must contain only numbers',
]);


        $employer = Employer::create($validated);

        return response()->json($employer, 201);
    }

     
    public function update(Request $request, $id)
    {
        $employer = Employer::find($id);

        if (!$employer) {
            return response()->json(['message' => 'Employer not found'], 404);
        }

        $validated = $request->validate([
            'full_name' => ['sometimes', 'required', 'string', 'max:100', 'regex:/^[a-zA-Z\s]+$/'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'nationality' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s]+$/'],
            'dob' => ['nullable', 'required', 'date', 'before_or_equal:today'],
            'national_id' => [
                'sometimes',
                'required',
                'string',
                'min:5',
                'max:20',
                'regex:/^[0-9]+$/',
                Rule::unique('employers')->ignore($employer->id),
            ],
            'address' => 'nullable|string',
            'phone' => ['nullable', 'string', 'regex:/^01[0125][0-9]{8}$/', Rule::unique('employers')->ignore($employer->id)],
            'department_id' => 'nullable|exists:departments,id',
            'contract_date' => 'nullable|date',
            'salary' => 'nullable|numeric',
            'attendance_time' => 'nullable|date_format:H:i',
            'leave_time' => 'nullable|date_format:H:i',
        ], [
            'full_name.regex' => 'Name must contain only English letters without numbers or special characters',
            'nationality.regex' => 'Nationality must contain only English letters without numbers or special characters',
            'dob.before_or_equal' => 'Date of birth cannot be in the future',
            'phone.regex' => 'Invalid phone number. Must start with 01 followed by 0, 1, 2, or 5 and then 8 digits',
            'phone.unique' => 'This phone number is already registered',
            'national_id.regex' => 'National ID must contain only numbers',
        ]);

        $employer->update($validated);

        
        if (isset($validated['department_id'])) {
            $employer->attendances()->update(['department_id' => $validated['department_id']]);
        }

        return response()->json($employer);
    }

 
    public function destroy($id)
    {
        $employer = Employer::find($id);

        if (!$employer) {
            return response()->json(['message' => 'Employer not found'], 404);
        }

        $employer->delete();

        return response()->json(['message' => 'Employer deleted successfully']);
    }

    // ---------------------------------------------------------------------------
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
    
        if ($attendance && $attendance->leave_time) {
            return response()->json(['message' => 'Cannot mark attendance after leave time'], 400);
        }
    
        if ($attendance && $attendance->attendance_time) {
            return response()->json(['message' => 'Attendance already marked'], 400);
        }
    
        if (!$attendance) {
            $attendance = new Attendance();
            $attendance->employer_id = $id;
            $attendance->department_id = $employer->department_id;
            $attendance->date = $today;
        }
    
        $now = Carbon::now('Africa/Cairo');
        $scheduledLeaveTime = Carbon::createFromTimeString($employer->leave_time, 'Africa/Cairo');
    
        if ($now->greaterThan($scheduledLeaveTime)) {
            return response()->json(['message' => 'Cannot mark attendance after scheduled leave time'], 400);
        }
    
        $attendance->attendance_time = $now->format('H:i');
        $attendance->save();
    
        $adjustmentMessage = '';
        if ($request->input('apply_adjustment', true)) {
            $recordedTime = Carbon::createFromTimeString($attendance->attendance_time, 'Africa/Cairo');
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
                $hours = round($minutesEarly / 60, 2);
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
    
        $now = Carbon::now('Africa/Cairo');
        $attendance->leave_time = $now->format('H:i');
        $attendance->save();
    
        $adjustmentMessage = '';
        if ($request->input('apply_adjustment', true)) {
            $recordedLeave = Carbon::createFromTimeString($attendance->leave_time, 'Africa/Cairo');
            $scheduledLeave = Carbon::createFromTimeString($employer->leave_time, 'Africa/Cairo');
    
            if ($recordedLeave->gt($scheduledLeave)) {
              
                $minutesLate = $recordedLeave->diffInMinutes($scheduledLeave);
                $hours = round($minutesLate / 60, 2);
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
    }}