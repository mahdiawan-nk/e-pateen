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
        Schema::table('kolam_samplings', function (Blueprint $table) {
            $table->uuid('seeding_id')->after('kolam_id');

            $table->foreign('seeding_id')->references('id')->on('kolam_seedings')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kolam_samplings', function (Blueprint $table) {
            $table->dropForeign(['seeding_id']);
            $table->dropColumn('seeding_id');
        });
    }
};
