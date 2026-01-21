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
            $table->decimal("weight", 10, 2)
                ->default(0)
                ->after("unit")->change();
            $table->text("formula_indicator")->nullable()->after("rules");
            $table->timestamp("created_at")->useCurrent()->after("formula_indicator")->change();
            $table->timestamp("updated_at")->useCurrent()->after("created_at")->useCurrentOnUpdate()->change();
        });
        Schema::table("transaksi_inputs", function (Blueprint $table) {
            $table->boolean("is_locked")
                ->default(false)
                ->after("nilai");
        });
        Schema::table("perhitungan_reports", function (Blueprint $table) {
            $table->integer("nilai_indicator")->default(0)->after("nilai");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
