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
        Schema::create('transaksi_inputs', function (Blueprint $table) {
            $table->id();
            $table->integer('year');
            $table->integer('month');
            $table->foreignId('master_input_id')->constrained('master_inputs')->cascadeOnDelete();
            $table->integer('nilai');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_inputs');
    }
};
