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
        Schema::create('kolam_monitorings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('kolam_id');
            $table->date('date');
            $table->decimal('water_temp_c', 5, 2)->nullable();
            $table->decimal('ph', 4, 2)->nullable();
            $table->decimal('oxygen_mg_l', 5, 2)->nullable();
            $table->decimal('ammonia_mg_l', 5, 2)->nullable();
            $table->decimal('turbidity_ntu', 6, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('kolam_id')->references('id')->on('kolams')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kolam_monitorings');
    }
};
