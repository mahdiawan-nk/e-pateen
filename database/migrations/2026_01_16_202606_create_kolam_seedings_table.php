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
        Schema::create('kolam_seedings', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // ================= RELASI =================
            $table->uuid('kolam_id')->comment('Kolam tempat seeding');
            $table->uuid('initial_movement_id')->nullable()
                ->comment('Referensi movement awal seeding (ledger)');

            // ================= DATA SEEDING =================
            $table->string('seed_type', 50)->comment('Jenis benih: patin, nila, lele');
            $table->unsignedInteger('initial_quantity')
                ->comment('Jumlah awal benih (readonly, sumber ledger)');
            $table->decimal('seed_size_cm', 5, 2)->nullable()
                ->comment('Panjang rata-rata benih (cm)');
            $table->decimal('average_weight_seed_g', 6, 2)->nullable()
                ->comment('Berat rata-rata benih (gram)');
            $table->date('date_seeded')->comment('Tanggal tebar benih');
            $table->string('source', 100)->nullable()
                ->comment('Supplier / asal benih');

            // ================= LIFECYCLE =================
            $table->enum('cycle_status', ['growing', 'harvest', 'closed'])
                ->default('growing')
                ->comment('Status siklus produksi');

            // ================= AUDIT =================
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('closed_by')->nullable();
            $table->timestamp('closed_at')->nullable();

            $table->timestamps();

            // ================= FOREIGN KEY =================
            $table->foreign('kolam_id')
                ->references('id')
                ->on('kolams')
                ->cascadeOnDelete();

            // $table->foreign('initial_movement_id')
            //     ->references('id')
            //     ->on('kolam_stock_movements')
            //     ->nullOnDelete();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->foreign('closed_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            // ================= INDEX =================
            $table->index(['kolam_id', 'cycle_status']);
            $table->index(['date_seeded']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kolam_seedings');
    }
};
