<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('employers', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('gender');
            $table->string('nationality');
            $table->date('dob');
            $table->string('national_id');
            $table->string('address');
            $table->string('phone');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->date('contract_date');
            $table->decimal('salary', 15, 2);
            $table->time('attendance_time');
            $table->time('leave_time');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('employers');
    }
};