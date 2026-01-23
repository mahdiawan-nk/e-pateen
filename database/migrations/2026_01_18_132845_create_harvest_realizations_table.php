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
        Schema::create('harvest_realizations', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // ================= RELASI =================
            $table->uuid('seeding_id')->comment('Referensi seeding kolam');
            $table->uuid('kolam_id')->comment('Kolam tempat panen dilakukan');
            $table->uuid('harvest_estimation_id')->nullable()->comment('Referensi ke estimasi panen');

            // ================= DATA PANEN =================
            $table->date('harvest_date')->comment('Tanggal panen dilakukan');
            $table->integer('harvested_population')->default(0)->comment('Jumlah ikan yang dipanen (ekor)');
            $table->decimal('average_weight_g', 8, 2)->nullable()->comment('Berat rata-rata per ekor saat panen');
            $table->decimal('total_biomass_kg', 10, 2)->nullable()->comment('Biomassa total (kg)');

            // ================= AUDIT & INFO =================
            $table->text('notes')->nullable()->comment('Catatan tambahan tentang panen');
            $table->uuid('created_by')->nullable();

            $table->timestamps();

            // ================= FOREIGN KEY =================
            $table->foreign('seeding_id')
                ->references('id')
                ->on('kolam_seedings')
                ->cascadeOnDelete();

            $table->foreign('kolam_id')
                ->references('id')
                ->on('kolams')
                ->cascadeOnDelete();

            $table->foreign('harvest_estimation_id')
                ->references('id')
                ->on('harvest_estimations')
                ->nullOnDelete();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            // ================= INDEX =================
            $table->index(['kolam_id', 'harvest_date']);
            $table->index(['seeding_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('harvest_realizations');
    }
};
