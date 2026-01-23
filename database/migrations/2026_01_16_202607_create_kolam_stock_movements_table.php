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
        Schema::create('kolam_stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // ================= RELASI =================
            $table->uuid('kolam_id');
            $table->uuid('seeding_id')->nullable()
                ->comment('Siklus seeding terkait');

            // ================= EVENT =================
            $table->enum('event_type', [
                'seeding',     // + stok awal
                'mortality',  // - kematian
                'harvest',    // - panen
                'adjustment', // +/- koreksi manual
                'transfer_in',// + pindah masuk
                'transfer_out'// - pindah keluar
            ]);

            $table->integer('quantity_change')
                ->comment('Delta stok: + atau -');

            // ================= LEDGER =================
            $table->integer('balance_after')
                ->comment('Saldo stok setelah movement (cache)');
            $table->unsignedInteger('balance_after_seeding')->nullable()
                ->comment('Saldo stok per seeding setelah event');
            // ================= CONTEXT =================
            $table->date('event_date');
            $table->string('ref_table', 50)->nullable()
                ->comment('Sumber event: kolam_samplings, kolam_seedings, dll');
            $table->uuid('ref_id')->nullable()
                ->comment('ID referensi sumber');

            // ================= AUDIT =================
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();

            $table->timestamps();

            // ================= FOREIGN KEY =================
            $table->foreign('kolam_id')
                ->references('id')
                ->on('kolams')
                ->cascadeOnDelete();

            $table->foreign('seeding_id')
                ->references('id')
                ->on('kolam_seedings')
                ->nullOnDelete();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            // ================= INDEX =================
            $table->index(['kolam_id', 'event_date']);
            $table->index(['seeding_id', 'event_type']);
            $table->index(['event_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kolam_stock_movements');
    }
};
