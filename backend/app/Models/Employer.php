<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employer extends Model
{
    protected $table = 'employers';

    protected $fillable = [
        'full_name', 'gender', 'nationality', 'dob',
        'national_id', 'address', 'phone', 'department_id',
        'contract_date', 'salary', 'attendance_time', 'leave_time'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}