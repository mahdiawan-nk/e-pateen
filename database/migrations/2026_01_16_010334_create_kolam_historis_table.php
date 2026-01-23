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
        Schema::create('kolam_historis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('kolam_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->string('action');
            $table->json('changes')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['kolam_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kolam_historis');
    }
};
