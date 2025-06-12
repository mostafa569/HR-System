<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Adjustment extends Model
{
    protected $fillable = [
        'employer_id',
        'date',
        'value',
        'value_type',
        'kind',
        'description'
    ];

    protected $casts = [
        'date' => 'date',
        'value' => 'float'
    ];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }
}
