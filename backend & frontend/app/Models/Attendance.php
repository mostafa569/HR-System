<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employer_id',
        'department_id',
        'date',
        'attendance_time',
        'leave_time',
    ];

    protected $casts = [
        'date' => 'date',
        'attendance_time' => 'datetime:H:i',
        'leave_time' => 'datetime:H:i',
    ];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}