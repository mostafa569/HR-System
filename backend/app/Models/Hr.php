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
<<<<<<< HEAD
                            'password'
=======
                            'password', 
                            'role',
>>>>>>> e628ae3db834d3289fbcfd55c9a0638c7a978399
                        ];

    protected $hidden = ['password'];
}

