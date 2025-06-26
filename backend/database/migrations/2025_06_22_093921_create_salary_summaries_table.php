<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('salary_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_id')->constrained()->onDelete('cascade');
            $table->string('month');
            $table->integer('year');
            $table->integer('attendance_days');
            $table->integer('absent_days');
            $table->decimal('additions_hours', 15, 2);
            $table->decimal('deductions_hours', 15, 2);
            $table->decimal('total_additions', 15, 2);
            $table->decimal('total_deductions', 15, 2);
            $table->decimal('final_salary', 15, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('salary_summaries');
    }
};