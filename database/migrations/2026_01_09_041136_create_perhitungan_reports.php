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
        Schema::table("master_reports", function (Blueprint $table) {
            $table->text("formula")->nullable()->change();
        });
        Schema::create('perhitungan_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('master_report_id')
                ->constrained('master_reports')
                ->cascadeOnDelete();
            $table->integer('year');
            $table->integer('month');
            $table->string('descIndikator');
            $table->text('formula');
            $table->text('formula_value');
            $table->float('nilai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perhitungan_reports');
    }
};
