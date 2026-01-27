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
            $table->text('formula_performance')->after('template_name')->nullable();
        });
        Schema::table('aspects', function (Blueprint $table) {
            $table->text('formula_aspect')->after('report_type_id')->nullable();
        });
        Schema::table('master_reports', function (Blueprint $table) {
            $table->integer('seq')->after('id')->nullable()->default(0)->index();
        });
        Schema::table('master_inputs', function (Blueprint $table) {
            $table->integer('seq')->after('id')->default(0)->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
