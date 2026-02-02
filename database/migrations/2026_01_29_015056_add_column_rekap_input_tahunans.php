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
        Schema::table('rekap_input_tahunans', function (Blueprint $table) {
            $table->foreignId('master_input_id')
                ->after('seq')->nullable()
                ->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekap_input_tahunans', function (Blueprint $table) {
            $table->dropForeign(['master_input_id']);
            $table->dropColumn('master_input_id');
        });
    }
};
