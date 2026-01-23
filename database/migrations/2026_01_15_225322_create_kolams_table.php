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
        Schema::create('kolams', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Informasi Kolam
            $table->string('name', 100)->comment('Nama kolam');
            $table->string('location', 150)->nullable()->comment('Lokasi kolam');

            // Dimensi Kolam (dalam meter)
            $table->decimal('length_m', 8, 2)->comment('Panjang kolam (meter)');
            $table->decimal('width_m', 8, 2)->comment('Lebar kolam (meter)');
            $table->decimal('depth_m', 8, 2)->comment('Kedalaman kolam (meter)');

            // Kapasitas & Volume
            $table->unsignedInteger('water_volume_l')
                ->comment('Volume air dalam liter (hasil perhitungan dimensi)');

            $table->unsignedInteger('capacity_fish')
                ->comment('Kapasitas maksimal ikan (ekor)');

            // Tipe & Status Kolam
            $table->string('type')
                ->comment('Jenis kolam');

            $table->enum('condition_status', [
                'active',
                'maintenance',
                'damaged'
            ])->default('active')
                ->comment('Status kondisi fisik kolam');

            $table->enum('production_status', [
                'idle',
                'stocking',
                'nursery',
                'growing',
                'harvest'
            ])->default('idle')
                ->comment('Status siklus pembudidayaan kolam');

            // Relasi User Pemilik
            $table->foreignUuid('owner_id')
                ->comment('ID pemilik kolam')
                ->constrained('users')
                ->cascadeOnDelete();

            // Indexing untuk performa
            $table->index('owner_id');
            $table->index('condition_status');
            $table->index('production_status');
            $table->index('type');

            // Composite index (dashboard & laporan)
            $table->index(['owner_id', 'condition_status']);
            $table->index(['owner_id', 'production_status']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kolams');
    }
};
