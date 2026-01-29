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
        Schema::table('master_inputs', function (Blueprint $table) {
            $table->foreignId('aspect_id')
                ->after('seq')
                ->nullable()->constrained()->cascadeOnDelete();
            $table->string('formula')
                ->nullable()
                ->after('master_source_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_inputs', function (Blueprint $table) {
            $table->dropForeign(['aspect_id']);
            $table->dropColumn('aspect_id');
            $table->dropColumn('formula');
        });
    }
};
