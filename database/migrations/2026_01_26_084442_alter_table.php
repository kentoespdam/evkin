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
            $table->text('formula_archivement')
                ->after('nilai_indicator')
                ->nullable()
                ->default('')
                ->change();
            $table->text('formula_archivement_value')
                ->after('formula_archivement')
                ->nullable()
                ->default('')
                ->change();
            $table->decimal('nilai_archivement', 10, 2)
                ->after('formula_archivement_value')
                ->nullable()
                ->default(0)
                ->change();
            $table->integer('nilai_archivement_indicator')
                ->after('nilai_archivement')
                ->nullable()
                ->default(0);
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
