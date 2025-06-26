<?php

namespace Database\Factories;

use App\Models\Hr;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class HrFactory extends Factory
{
    protected $model = Hr::class;

    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password123'), // Default password for all fake users
            'role' => fake()->randomElement(['hr', 'super admin']),
        ];
    }
}
