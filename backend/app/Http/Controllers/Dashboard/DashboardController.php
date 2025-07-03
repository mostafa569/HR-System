<?php

namespace App\Http\Controllers\Dashboard;

use Carbon\Carbon;
use App\Models\Holiday;
use App\Models\Employer;
use App\Models\Attendance;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    /**
     * Get all dashboard data in one endpoint
     */
    public function index()
    {
        $data = [
            'stats' => $this->getDashboardStatsData(),
            'recent_employers' => $this->getRecentEmployers(),
            'attendance_today' => $this->getTodayAttendanceData(),
            'upcoming_holidays' => $this->getUpcomingHolidaysData()
        ];
        
        return response()->json($data);
    }
    
    /**
     * Get dashboard statistics
     */
    public function getDashboardStats()
    {
        return response()->json($this->getDashboardStatsData());
    }
    
    /**
     * Get all employers with pagination
     */
    public function getAllEmployers(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $employers = Employer::with('department')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
            
        return response()->json($employers);
    }
    
    /**
     * Get today's attendance data
     */
    public function getTodayAttendance()
    {
        return response()->json($this->getTodayAttendanceData());
    }
    
    /**
     * Get upcoming holidays
     */
    public function getUpcomingHolidays()
    {
        return response()->json($this->getUpcomingHolidaysData());
    }
    
    // Protected methods for data fetching
    
    protected function getDashboardStatsData()
    {
        $totalEmployees = Employer::count();
        $totalDepartments = Department::count();
        $today = Carbon::today();
        
        $attendanceData = $this->getTodayAttendanceData();
        
        return [
            'total_employees' => $totalEmployees,
            'total_departments' => $totalDepartments,
            'attendance_today' => $attendanceData['percentage'],
            'present_today' => $attendanceData['present'],
            'absent_today' => $attendanceData['absent'],
            'late_today' => $attendanceData['late']
        ];
    }
    
    protected function getTodayAttendanceData()
    {
        $today = Carbon::today()->toDateString();
        $totalEmployees = Employer::count();
        
        $presentToday = Attendance::whereDate('date', $today)->count();
        $lateToday = Attendance::whereDate('date', $today)
        ->whereRaw('TIME(attendances.attendance_time) > TIME(employers.attendance_time)')
        ->join('employers', 'attendances.employer_id', '=', 'employers.id')
        ->count();
            
        $percentage = $totalEmployees > 0 
            ? round(($presentToday / $totalEmployees) * 100, 2) 
            : 0;
            
        return [
            'present' => $presentToday,
            'absent' => $totalEmployees - $presentToday,
            'late' => $lateToday,
            'percentage' => $percentage,
            'total' => $totalEmployees,
            'date' => $today
        ];
    }
    
    protected function getUpcomingHolidaysData()
    {
        $today = Carbon::today();
        
        return Holiday::whereDate('date', '>=', $today)
            ->orderBy('date')
            ->take(5)
            ->get()
            ->map(function ($holiday) {
                $date = Carbon::parse($holiday->date);
                
                return [
                    'id' => $holiday->id,
                    'name' => $holiday->name,
                    'date' => $date->format('Y-m-d'),
                    'day' => $date->isoFormat('dddd'),
                    'type' => $holiday->type,
                    'days_until' => $date->diffInDays(Carbon::today()),
                ];
            });
    }
    protected function getRecentEmployers($limit = 5)
    {
        return Employer::with('department')
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->get()
            ->map(function ($employer) {
                return [
                    'id' => $employer->id,
                    'name' => $employer->full_name,
                    'department' => $employer->department ? $employer->department->name : null,
                    'join_date' => $employer->contract_date
                ];
            });
    }
}