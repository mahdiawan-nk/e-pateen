<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('kolam_id');
            $table->enum('activity_type', ['seeding', 'feeding', 'sampling', 'other']);
            $table->date('scheduled_date');
            $table->time('scheduled_time')->nullable();
            $table->text('details')->nullable();
            $table->enum('status', ['pending', 'done', 'cancelled'])->default('pending');
            // $table->uuid('assigned_to')->nullable();
            $table->uuid('created_by');
            $table->timestamps();

            // Foreign keys
            $table->foreign('kolam_id')->references('id')->on('kolams')->onDelete('cascade');
            // $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
