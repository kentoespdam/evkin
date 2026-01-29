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
        Schema::create('rekap_input_tahunans', function (Blueprint $table) {
            $table->id();
            $table->integer('seq')->default(0)->index();
            $table->string('kode')->default('')->index();
            $table->string('description')->default('')->index();
            $table->string('satuan')->default('');
            $table->foreignId('master_source_id')->constrained()->cascadeOnDelete();
            $table->date('periode')->default('1970-01-01');
            $table->integer('year');
            $table->integer('month');
            $table->decimal('nilai', 10, 2)->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekap_input_tahunans');
    }
};
