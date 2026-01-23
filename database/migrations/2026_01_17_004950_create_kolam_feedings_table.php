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
        Schema::create('kolam_feedings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('kolam_id');
            $table->date('feeding_date');
            $table->string('feed_type');
            $table->decimal('quantity_kg', 8, 2);
            $table->string('feeding_method')->nullable();
            $table->string('feed_source')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();

            // Foreign keys
            $table->foreign('kolam_id')->references('id')->on('kolams')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['kolam_id', 'feeding_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kolam_feedings');
    }
};
