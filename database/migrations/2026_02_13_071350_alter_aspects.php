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
        Schema::table('aspects', function (Blueprint $table) {
            $table->dropColumn('formula_aspect');
            $table->integer('max_score')->nullable()->default(0)->after('name');
            $table->integer('weight')->nullable()->default(0)->after('max_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aspects', function (Blueprint $table) {
            $table->string('formula_aspect')->nullable()->after('name');
            $table->dropColumn('max_score');
            $table->dropColumn('weight');
        });
    }
};
