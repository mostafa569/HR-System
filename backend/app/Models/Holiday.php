<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
protected $fillable = ['day', 'date', 'type', 'name'];

protected $casts = [
'date' => 'date'
];
}