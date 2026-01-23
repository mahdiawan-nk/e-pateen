<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('kolams', function (Blueprint $table) {
            $table->boolean('is_deleted')->default(false)->after('owner_id');
            $table->index('is_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kolams', function (Blueprint $table) {
            $table->dropColumn('is_deleted');
            $table->dropIndex('kolams_is_deleted_index');
        });
    }
};
