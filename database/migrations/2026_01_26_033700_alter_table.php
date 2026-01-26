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
        Schema::table('report_types', function (Blueprint $table) {
            $table->string('template_name')->nullable()->after('name');
        });
        Schema::table('master_reports', function (Blueprint $table) {
            $table->text('formula_archivement')->after('formula_indicator');
        });

        Schema::table('perhitungan_reports', function (Blueprint $table) {
            $table->text('formula_archivement')->after('formula_value');
            $table->text('formula_archivement_value')->after('formula_archivement');
            $table->text('nilai_archivement')->after('formula_archivement_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_types', function (Blueprint $table) {
            $table->dropColumn('template_name');
        });
        Schema::table('master_reports', function (Blueprint $table) {
            $table->dropColumn('formula_archivement');
        });
        Schema::table('perhitungan_reports', function (Blueprint $table) {
            $table->dropColumn('formula_archivement');
            $table->dropColumn('formula_archivement_value');
            $table->dropColumn('nilai_archivement');
        });
    }
};
