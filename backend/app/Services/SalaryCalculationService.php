<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Holiday;
use App\Models\Employer;
use App\Models\Adjustment;
use App\Models\Attendance;
use App\Models\SalarySummary;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SalaryCalculationService
{
    public function calculateSalary($employerId, $year = null, $month = null)
    {
        try {
            DB::beginTransaction();
    
            $year = $year ?? Carbon::now()->year;
            $month = $month ?? Carbon::now()->month;
    
            Log::info("Starting salary calculation for employer $employerId, $year-$month");
    
            $employer = $this->getEmployer($employerId);
            if (!$employer) {
                throw new \Exception("Employer not found");
            }
    
            $baseSalary = $employer->salary;
            if (!$baseSalary || $baseSalary <= 0) {
                throw new \Exception("Invalid base salary for employer");
            }
    
            $dateRange = $this->getDateRange($year, $month);
            $daysInMonth = 30;
    
            $holidays = $this->getHolidays($dateRange['startDate'], $dateRange['endDate']);
            $holidaysCount = $holidays->count();
    
            $workingHoursPerDay = $this->calculateWorkingHoursPerDay($employer);
            if ($workingHoursPerDay <= 0) {
                throw new \Exception("Invalid working hours calculation");
            }
    
            $hourlyRate = $this->calculateHourlyRate($baseSalary, $daysInMonth, $workingHoursPerDay);
            $attendanceDays = $this->getAttendanceDays($employerId, $dateRange);
            $absentDays = $this->calculateAbsentDays($daysInMonth, $holidaysCount, $attendanceDays);
    
            $adjustments = $this->getAdjustments($employerId, $dateRange);
            $adjustmentCalculations = $this->calculateAdjustments($adjustments, $hourlyRate);
    
            $salaryCalculations = $this->calculateFinalSalary(
                $baseSalary, 
                $attendanceDays, 
                $absentDays, 
                $adjustmentCalculations, 
                $workingHoursPerDay,
                $hourlyRate
            );
    
            $this->saveSalarySummary($employerId, $year, $month, $dateRange, $attendanceDays, $absentDays, $adjustmentCalculations, $salaryCalculations);
    
            DB::commit();
    
            return $this->formatSalaryResponse(
                $employerId, 
                $year, 
                $month, 
                $dateRange, 
                $daysInMonth, 
                $baseSalary, 
                $hourlyRate, 
                $attendanceDays, 
                $absentDays, 
                $adjustmentCalculations, 
                $salaryCalculations, 
                $workingHoursPerDay
            );
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Salary calculation failed: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            throw new \Exception("Salary calculation failed: " . $e->getMessage());
        }
    }

    protected function calculateWorkingHoursPerDay($employer)
    {
        if (!$employer->attendance_time || !$employer->leave_time) {
            return 8;  
        }
    
        $attendance = Carbon::createFromTimeString($employer->attendance_time);
        $leave = Carbon::createFromTimeString($employer->leave_time);
    
        $workingHours = abs($leave->diffInHours($attendance));
    
        if ($workingHours > 12) {
            $workingHours = 24 - $workingHours;
        }

        return $workingHours;
    }

    protected function getEmployer($employerId)
    {
        return Employer::findOrFail($employerId);
    }

    protected function getDateRange($year, $month)
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        return [
            'startDate' => $startDate,
            'endDate' => $startDate->copy()->endOfMonth()
        ];
    }

    protected function getHolidays($startDate, $endDate)
    {
        return Holiday::where(function($query) use ($startDate, $endDate) {
            $query->where('type', 'weekly')->whereNotNull('day')
                  ->whereBetween('date', [$startDate, $endDate]);
            $query->orWhere(function($q) use ($startDate, $endDate) {
                $q->where('type', 'official')
                  ->whereNotNull('date')
                  ->whereBetween('date', [$startDate, $endDate]);
            });
        })->get();
    }

    protected function getAttendanceDays($employerId, $dateRange)
    {
        return Attendance::where('employer_id', $employerId)
            ->whereBetween('date', [$dateRange['startDate'], $dateRange['endDate']])
            ->distinct('date')
            ->count('date');
    }

    protected function calculateAbsentDays($daysInMonth, $holidaysCount, $attendanceDays)
    {
        return max(0, $daysInMonth - ($holidaysCount + $attendanceDays));
    }

    protected function getAdjustments($employerId, $dateRange)
    {
        return Adjustment::where('employer_id', $employerId)
            ->whereBetween('date', [$dateRange['startDate'], $dateRange['endDate']])
            ->get();
    }

    protected function calculateAdjustments($adjustments, $hourlyRate)
    {
        $additionsHours = 0;
        $deductionsHours = 0;
        $totalAdditions = 0;
        $totalDeductions = 0;

        foreach ($adjustments as $adjustment) {
            $value = floatval($adjustment->value ?? 0);
            if ($value <= 0) continue;

            if ($adjustment->value_type === 'hours') {
                if ($adjustment->kind === 'addition') {
                    $additionsHours += $value;
                    $totalAdditions += $value * $hourlyRate;
                } else if ($adjustment->kind === 'deduction') {
                    $deductionsHours += $value;
                    $totalDeductions += $value * $hourlyRate;
                }
            } else if ($adjustment->value_type === 'money') {
                if ($adjustment->kind === 'addition') {
                    $totalAdditions += $value;
                } else if ($adjustment->kind === 'deduction') {
                    $totalDeductions += $value;
                }
            }
        }

        return [
            'additions_hours' => round($additionsHours, 2),
            'deductions_hours' => round($deductionsHours, 2),
            'total_additions' => round($totalAdditions, 2),
            'total_deductions' => round($totalDeductions, 2)
        ];
    }

    protected function calculateHourlyRate($baseSalary, $daysInMonth, $workingHoursPerDay)
    {
        return $baseSalary / ($daysInMonth * $workingHoursPerDay);
    }

    protected function calculateFinalSalary($baseSalary, $attendanceDays, $absentDays, $adjustmentCalculations, $workingHoursPerDay, $hourlyRate)
    {
        // Calculate absent deduction based on hours
        $absentHours = $absentDays * $workingHoursPerDay;
        $absentDeduction = $absentHours * $hourlyRate;
        
        // Calculate salary based on actual working hours
        $workedHours = $attendanceDays * $workingHoursPerDay;
        $workedSalary = $workedHours * $hourlyRate;
        
        // Apply adjustments
        $finalSalary = max(0, $workedSalary + $adjustmentCalculations['total_additions'] - $adjustmentCalculations['total_deductions']);

        return [
            'base_salary' => round($baseSalary, 2),
            'worked_salary' => round($workedSalary, 2),
            'absent_deduction' => round($absentDeduction, 2),
            'final_salary' => round($finalSalary, 2)
        ];
    }

    protected function saveSalarySummary($employerId, $year, $month, $dateRange, $attendanceDays, $absentDays, $adjustmentCalculations, $salaryCalculations)
    {
        $monthName = Carbon::create()->month($month)->format('F');
    
        $existingSummary = SalarySummary::where('employer_id', $employerId)
            ->where('year', $year)
            ->where('month', $monthName)
            ->first();
    
        $data = [
            'employer_id' => $employerId,
            'month' => $monthName,
            'year' => $year,
            'attendance_days' => $attendanceDays,
            'absent_days' => $absentDays,
            'additions_hours' => $adjustmentCalculations['additions_hours'],
            'deductions_hours' => $adjustmentCalculations['deductions_hours'],
            'total_additions' => $adjustmentCalculations['total_additions'],
            'total_deductions' => $adjustmentCalculations['total_deductions'],
            'final_salary' => $salaryCalculations['final_salary']
        ];
    
        if ($existingSummary) {
            $existingSummary->update($data);
            return $existingSummary;
        }

        return SalarySummary::create($data);
    }

    protected function formatSalaryResponse($employerId, $year, $month, $dateRange, $daysInMonth, $baseSalary, $hourlyRate, $attendanceDays, $absentDays, $adjustmentCalculations, $salaryCalculations, $workingHoursPerDay)
    {
        return [
            'employer_id' => $employerId,
            'month' => $dateRange['startDate']->format('F'),
            'year' => $year,
            'days_in_month' => $daysInMonth,
            'working_hours_per_day' => $workingHoursPerDay,
            'hourly_rate' => round($hourlyRate, 2),
            'base_salary' => round($baseSalary, 2),
            'attendance_days' => $attendanceDays,
            'absent_days' => $absentDays,
            'additions_hours' => $adjustmentCalculations['additions_hours'],
            'deductions_hours' => $adjustmentCalculations['deductions_hours'],
            'total_additions' => $adjustmentCalculations['total_additions'],
            'total_deductions' => $adjustmentCalculations['total_deductions'],
            'absent_deduction' => $salaryCalculations['absent_deduction'],
            'worked_salary' => $salaryCalculations['worked_salary'],
            'final_salary' => $salaryCalculations['final_salary'],
        ];
    }
}