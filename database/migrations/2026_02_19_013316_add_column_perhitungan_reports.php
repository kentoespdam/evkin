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
            $table->string('formula_nilai_bobot_archivement')
                ->default('')
                ->after('nilai_archivement_indicator');
            $table->decimal('nilai_bobot_archivement', 15, 2)
                ->default(0)
                ->after('formula_nilai_bobot_archivement');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perhitungan_reports', function (Blueprint $table) {
            $table->dropColumn('formula_nilai_bobot_archivement');
            $table->dropColumn('nilai_bobot_archivement');
        });
    }
};
