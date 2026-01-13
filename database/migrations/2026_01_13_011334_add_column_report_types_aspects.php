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
        Schema::table("aspects", function (Blueprint $table) {
            $table->foreignId("report_type_id")
                ->after("name")
                ->default(1)
                ->constrained("report_types")
                ->cascadeOnDelete();
        });
        Schema::table("master_reports", function (Blueprint $table) {
            $table->boolean("with_rules")->default(false);
            $table->text("rules")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("aspects", function (Blueprint $table) {
            $table->dropForeign(["report_type_id"]);
            $table->dropColumn("report_type_id");
        });
        Schema::table("master_reports", function (Blueprint $table) {
            $table->dropColumn("with_rules");
            $table->dropColumn("rules");
        });
    }
};
