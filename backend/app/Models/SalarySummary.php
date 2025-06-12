<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalarySummary extends Model
{
    public $timestamps = false;  
    
    protected $fillable = [
        'employer_id',
        'month',
        'year',
        'attendance_days',
        'absent_days',
        'late_days',
        'additions_hours',
        'deductions_hours',
        'total_salary',
        'total_deductions',
        'total_additions',
        'net_salary',
        'overtime_hours',
        'overtime_amount',
        'deductions_details',
        'final_salary',
        'base_salary',
        'absent_deduction'
    ];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }
}