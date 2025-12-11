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
        Schema::create('master_sources', function (Blueprint $table) {
            $table->id()->unsigned();
            $table->string('name')->unique();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('master_inputs', function (Blueprint $table) {
            $table->id()->unsigned();
            $table->string('kode')->unique();
            $table->string('description');
            $table->foreignId('master_source_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('role_inputs', function (Blueprint $table) {
            $table->id()->unsigned();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('master_input_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->unique(['role_id', 'master_input_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_sources');
        Schema::dropIfExists('master_inputs');
        Schema::dropIfExists('role_input');
    }
};
