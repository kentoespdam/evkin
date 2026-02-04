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
        Schema::table('perhitungan_reports', function (Blueprint $table) {
            $table->text('formula_nilai_bobot')
                ->default("")
                ->after('nilai_indicator');
            $table->decimal('nilai_bobot', 10, 2)
                ->default(0)->after('formula_nilai_bobot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perhitungan_reports', function (Blueprint $table) {
            $table->dropColumn('formula_nilai_bobot');
            $table->dropColumn('nilai_bobot');
        });
    }
};
