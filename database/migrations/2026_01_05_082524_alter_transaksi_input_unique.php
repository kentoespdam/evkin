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
        Schema::table('transaksi_inputs', function (Blueprint $table) {
            $table
                ->unique(
                    ['master_input_id', 'year', 'month'],
                    'transaksi_inputs_unique_master_input_tahun_bulan'
                );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaksi_inputs', function (Blueprint $table) {
            $table->dropUnique(['master_input_id', 'year', 'month']);
        });
    }
};
