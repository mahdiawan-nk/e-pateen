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
        Schema::create('kolam_samplings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('kolam_id');
            $table->date('sampling_date');
            $table->integer('day_since_last')->default(0);

            // Populasi & sampling
            $table->integer('estimated_population')->default(0);
            $table->integer('sample_size')->default(0);
            $table->string('sampling_method')->nullable();

            // Input pertumbuhan
            $table->decimal('avg_weight_start_g', 8, 2)->nullable(); // W0
            $table->decimal('avg_weight_end_g', 8, 2)->nullable();   // Wt
            $table->decimal('avg_length_start_cm', 5, 2)->nullable(); // L0
            $table->decimal('avg_length_end_cm', 5, 2)->nullable();   // Lt

            // Hasil perhitungan otomatis
            $table->decimal('abs_weight_growth_g', 8, 2)->nullable();
            $table->decimal('abs_length_growth_cm', 5, 2)->nullable();
            $table->decimal('daily_growth_g', 8, 3)->nullable();
            $table->decimal('sgr_percent', 5, 2)->nullable();
            $table->decimal('biomass_kg', 10, 2)->nullable();

            // Mortalitas
            $table->integer('mortality_count')->default(0);
            $table->decimal('survival_rate', 5, 2)->nullable();

            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            // ================= FOREIGN KEY =================
            $table->foreign('kolam_id')
                ->references('id')
                ->on('kolams')
                ->cascadeOnDelete();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            // ================= INDEX =================
            $table->index(['kolam_id', 'sampling_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kolam_samplings');
    }
};
