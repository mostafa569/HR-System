<?php

namespace App\Http\Controllers\SalarySummary;

use Carbon\Carbon;
use App\Models\Employer;
use Illuminate\Http\Request;
use App\Models\SalarySummary;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Services\SalaryCalculationService;

class SalarySummaryController extends Controller
{
    protected $salaryService;

    public function __construct(SalaryCalculationService $salaryService)
    {
        $this->salaryService = $salaryService;
    }

    public function index(Request $request)
    {
        try {
            $query = SalarySummary::with(['employer', 'employer.department'])
                ->select('salary_summaries.*')
                ->join('employers', 'salary_summaries.employer_id', '=', 'employers.id')
                ->join('departments', 'employers.department_id', '=', 'departments.id');
    
            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('employers.full_name', 'like', "%{$search}%")
                      ->orWhere('employers.national_id', 'like', "%{$search}%");
                });
            }
    
            if ($request->filled('department_id')) {
                $query->where('employers.department_id', $request->department_id);
            }
    
            if ($request->filled('month')) {
                $query->where('salary_summaries.month', $request->month);
            }
    
            if ($request->filled('year')) {
                $query->where('salary_summaries.year', $request->year);
            }
    
            // Apply sorting
            $sortBy = $request->get('sort_by', 'year');
            $sortDirection = $request->get('sort_direction', 'desc');
            
            if ($sortBy === 'department_name') {
                $query->orderBy('departments.name', $sortDirection);
            } elseif ($sortBy === 'full_name') {
                $query->orderBy('employers.full_name', $sortDirection);
            } else {
                $query->orderBy('salary_summaries.' . $sortBy, $sortDirection);
            }
    
            // Get paginated results
            $perPage = $request->get('per_page', 10);
            $summaries = $query->paginate($perPage);
    
             
            $summariesItems = $summaries->items();
            foreach ($summariesItems as $summary) {
                
                $employer = $summary->employer;
                if ($employer && isset($summary->absent_days)) {
                    $dailySalary = $employer->salary / 30;
                    $summary->absent_deduction = round($summary->absent_days * $dailySalary, 2);
                } else {
                    $summary->absent_deduction = 0;
                }
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'summaries' => $summariesItems,
                    'total' => $summaries->total(),
                    'per_page' => $summaries->perPage(),
                    'current_page' => $summaries->currentPage(),
                    'last_page' => $summaries->lastPage()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function calculate(Request $request)
    {
        $request->validate([
            'employer_id' => 'required|exists:employers,id',
            // 'year' => 'required|integer|min:2000|max:2100',
            // 'month' => 'required|integer|min:1|max:12'
        ]);

        try {

            $monthName = Carbon::create()->month($request->input('month'))->format('F');

            $existingSummary = SalarySummary::where('employer_id', $request->input('employer_id'))
                ->where('year', $request->input('year'))
                ->where('month', $monthName)
                ->first();

            $result = $this->salaryService->calculateSalary(
                $request->input('employer_id'),
                $request->input('year'),
                $request->input('month')
            );

            $responseData = [
                'status' => 'success',
                'message' => $existingSummary ? 'Salary summary updated successfully' : 'Salary summary calculated successfully',
                'data' => $result
            ];

            if ($existingSummary) {
                $responseData['data']['id'] = $existingSummary->id;
            }

            return response()->json($responseData);
        } catch (\Exception $e) {
            \Log::error('Salary calculation error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error calculating salary: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getSalarySummary($employerId)
    {
        try {
            $employer = DB::table('employers')
                ->select('employers.*', 'departments.name as department_name')
                ->leftJoin('departments', 'employers.department_id', '=', 'departments.id')
                ->where('employers.id', $employerId)
                ->first();

            if (!$employer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Employer not found'
                ], 404);
            }

            $salarySummaries = DB::table('salary_summaries')
                ->where('employer_id', $employerId)
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->get();

            $uniqueSummaries = $salarySummaries->groupBy(function ($summary) {
                return $summary->year . '-' . $summary->month;
            })->map(function ($group) {
                return $group->first();
            })->values();

            $uniqueSummaries->transform(function ($summary) use ($employer) {
                $dailySalary = $employer->salary / 30;
                $summary->absent_deduction = round($summary->absent_days * $dailySalary, 2);


                $summary->total_additions = floatval($summary->total_additions ?? 0);
                $summary->total_deductions = floatval($summary->total_deductions ?? 0);
                $summary->additions_hours = floatval($summary->additions_hours ?? 0);
                $summary->deductions_hours = floatval($summary->deductions_hours ?? 0);

                $totalDeductions = $summary->total_deductions + $summary->absent_deduction;
                $summary->final_salary = max(0, $employer->salary + $summary->total_additions - $totalDeductions);
                if (isset($summary->attendance_days) && $summary->attendance_days == 0) {
                    $summary->final_salary = 0;
                }
                return $summary;
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'employer' => $employer,
                    'summaries' => $uniqueSummaries
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}