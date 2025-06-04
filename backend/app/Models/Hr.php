<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Hr extends Authenticatable
{
     use HasApiTokens;
    protected $table = 'hr_users';
    public $timestamps = true;


    protected $fillable = [
                            'full_name',
                            'username',
                            'email',
                            'password'
                        ];

    protected $hidden = ['password'];
}

