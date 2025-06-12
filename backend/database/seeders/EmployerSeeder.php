<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employer;
use Illuminate\Support\Facades\DB;

class EmployerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure departments exist first, as employers depend on them
        $hrDepartmentId = DB::table('departments')->where('name', 'Human Resources')->value('id');
        $engineeringDepartmentId = DB::table('departments')->where('name', 'Engineering')->value('id');
        $marketingDepartmentId = DB::table('departments')->where('name', 'Marketing')->value('id');

        Employer::create([
            'full_name' => 'Alice Johnson',
            'gender' => 'female',
            'nationality' => 'Egyptian',
            'dob' => '1988-03-22',
            'national_id' => '28803220100000',
            'address' => '789 Oak Avenue, Cairo',
            'phone' => '01234567890',
            'department_id' => $hrDepartmentId,
            'contract_date' => '2020-01-15',
            'salary' => 7500.00,
            'attendance_time' => '09:00:00',
            'leave_time' => '17:00:00',
        ]);

        Employer::create([
            'full_name' => 'Bob Williams',
            'gender' => 'male',
            'nationality' => 'Egyptian',
            'dob' => '1992-07-11',
            'national_id' => '29207110100000',
            'address' => '101 Pine Street, Giza',
            'phone' => '01098765432',
            'department_id' => $engineeringDepartmentId,
            'contract_date' => '2021-06-01',
            'salary' => 12000.00,
            'attendance_time' => '09:00:00',
            'leave_time' => '17:00:00',
        ]);

        Employer::create([
            'full_name' => 'Carol White',
            'gender' => 'female',
            'nationality' => 'Egyptian',
            'dob' => '1995-11-30',
            'national_id' => '29511300100000',
            'address' => '202 Elm Street, Alexandria',
            'phone' => '01123456789',
            'department_id' => $marketingDepartmentId,
            'contract_date' => '2022-09-01',
            'salary' => 9000.00,
            'attendance_time' => '09:00:00',
            'leave_time' => '17:00:00',
        ]);
    }
}
