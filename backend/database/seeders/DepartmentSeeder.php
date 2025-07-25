<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Department::create([
            'name' => 'Human Resources',
            
        ]);

        Department::create([
            'name' => 'Engineering',
        ]);

        Department::create([
            'name' => 'Marketing',
        ]);

        Department::create([
            'name' => 'Sales',
        ]);
    }
}
