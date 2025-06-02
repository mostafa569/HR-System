<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// This model represents the 'departments' table in the database and manages department-related data.
class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];
    

    public function employers(): HasMany
    {
        return $this->hasMany(Employer::class, 'department_id');
    }
}