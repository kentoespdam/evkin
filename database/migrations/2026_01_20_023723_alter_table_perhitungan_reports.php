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
        Schema::table('perhitungan_reports', function (Blueprint $table) {
            $table->unique(['master_report_id', 'year', 'month'], 'unique_perhitungan_report');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perhitungan_reports', function (Blueprint $table) {
            $table->dropUnique('unique_perhitungan_report');
        });
    }
};
