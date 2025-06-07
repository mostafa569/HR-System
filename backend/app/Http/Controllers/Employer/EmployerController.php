<?php

namespace App\Http\Controllers\Employer;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App\Models\Employer;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployerController extends Controller
{
    
<<<<<<< HEAD
    public function index(Request $request)
    {
      
        $employers = Employer::with('department')->paginate(10);
        return response()->json($employers);
=======
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
>>>>>>> e628ae3db834d3289fbcfd55c9a0638c7a978399
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
<<<<<<< HEAD
        $validated = $request->validate([
            'full_name' => 'required|string|max:100',
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'nationality' => 'nullable|string|max:50',
            'dob' => 'required|date',
            'national_id' => 'required|string|max:20|unique:employers,national_id',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'department_id' => 'nullable|exists:departments,id',
            'contract_date' => 'nullable|date',
            'salary' => 'nullable|numeric',
            'attendance_time' => 'nullable|date_format:H:i',
            'leave_time' => 'nullable|date_format:H:i',
        ]);
=======
       $validated = $request->validate([
    'full_name' => 'required|string|max:100',
    'gender' => ['required', Rule::in(['male', 'female', 'other'])],
    'nationality' => 'required|string|max:50',
    'dob' => 'required|date',
    'national_id' => ['required', 'string', 'size:14', 'regex:/^(2|3)\d{13}$/', 'unique:employers,national_id'],
    'address' => 'required|string',
    'phone' => 'required|string|max:20',
    'department_id' => 'required|exists:departments,id',
    'contract_date' => 'required|date',
    'salary' => 'required|numeric',
    'attendance_time' => 'required|date_format:H:i',
    'leave_time' => 'required|date_format:H:i',
]);

>>>>>>> e628ae3db834d3289fbcfd55c9a0638c7a978399

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
            'full_name' => 'sometimes|required|string|max:100',
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'nationality' => 'nullable|string|max:50',
            'dob' => 'nullable|required|date',
            'national_id' => [
                'sometimes',
                'required',
                'string',
                'max:20',
<<<<<<< HEAD
=======
                'regex:/^(2|3)\d{13}$/',
>>>>>>> e628ae3db834d3289fbcfd55c9a0638c7a978399
                Rule::unique('employers')->ignore($employer->id),
            ],
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'department_id' => 'nullable|exists:departments,id',
            'contract_date' => 'nullable|date',
            'salary' => 'nullable|numeric',
            'attendance_time' => 'nullable|date_format:H:i',
            'leave_time' => 'nullable|date_format:H:i',
        ]);

        $employer->update($validated);

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
      public function attendEmployer($id)
    {
        $employer = Employer::find($id);
        if (!$employer) {
            return response()->json(['message' => 'Employer not found'], 404);
        }

        $today = Carbon::today();
 
        $attendance = Attendance::where('employer_id', $id)
            ->where('date', $today)
            ->first();

        if ($attendance && $attendance->attendance_time) {
            return response()->json(['message' => 'Attendance already marked for today'], 400);
        }

        if (!$attendance) {
            $attendance = new Attendance();
            $attendance->employer_id = $id;
            $attendance->department_id = $employer->department_id;
            $attendance->date = $today;
        }

        $attendance->attendance_time = Carbon::now('Africa/Cairo')->format('H:i');
        $attendance->save();

        return response()->json(['message' => 'Attendance marked successfully', 'attendance' => $attendance]);
    }

    
    public function leaveEmployer($id)
    {
        $employer = Employer::find($id);
        if (!$employer) {
            return response()->json(['message' => 'Employer not found'], 404);
        }

        $today = Carbon::today();

        $attendance = Attendance::where('employer_id', $id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->attendance_time) {
            return response()->json(['message' => 'Attendance not marked yet for today'], 400);
        }

        if ($attendance->leave_time) {
            return response()->json(['message' => 'Leave time already marked for today'], 400);
        }

        $attendance->leave_time = Carbon::now('Africa/Cairo')->format('H:i');
        $attendance->save();

        return response()->json(['message' => 'Leave time marked successfully', 'attendance' => $attendance]);
    }
}