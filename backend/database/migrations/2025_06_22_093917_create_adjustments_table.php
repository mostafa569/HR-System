<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_id')->constrained()->onDelete('cascade');
            $table->decimal('value', 15, 2);
            $table->string('value_type')->comment('ENUM: money, hours');
            $table->string('kind')->comment('ENUM: addition, deduction');
            $table->string('reason');
            $table->date('date');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('adjustments');
    }
};