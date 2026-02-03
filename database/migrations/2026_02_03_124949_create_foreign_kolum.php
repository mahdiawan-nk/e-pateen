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
        Schema::table('kolam_seedings', function (Blueprint $table) {
            $table->foreign('initial_movement_id')
                ->references('id')
                ->on('kolam_stock_movements')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kolam_seedings', function (Blueprint $table) {
            $table->dropForeign(['initial_movement_id']);
        });
    }
};
