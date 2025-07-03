<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Adjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'employer_id',
        'date',
        'value',
        'value_type',
        'kind',
        'reason',
    ];

    protected $casts = [
        'date' => 'date',
        'value' => 'float',
    ];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }
}