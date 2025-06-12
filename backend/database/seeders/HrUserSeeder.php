<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Hr;
use Illuminate\Support\Facades\Hash;

class HrUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create default admin user
        Hr::create([
            'full_name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@hr.com',
            'password' => Hash::make('admin123'),
        ]);

      
    }
}
