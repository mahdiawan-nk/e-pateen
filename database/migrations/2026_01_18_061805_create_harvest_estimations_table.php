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
        Schema::create('harvest_estimations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('seeding_id');
            $table->uuid('kolam_id');
            $table->date('estimated_harvest_date')->nullable();
            $table->integer('estimated_population')->default(0);
            $table->decimal('estimated_avg_weight_g', 8, 2)->nullable();
            $table->decimal('estimated_biomass_kg', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('seeding_id')->references('id')->on('kolam_seedings')->cascadeOnDelete();
            $table->foreign('kolam_id')->references('id')->on('kolams')->cascadeOnDelete();

            $table->index(['kolam_id', 'estimated_harvest_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('harvest_estimations');
    }
};
