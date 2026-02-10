<?php

namespace Database\Factories\Transaksi;

use App\Models\Master\MasterInputs;
use App\Models\Master\MasterSources;
use App\Models\Transaksi\RekapInputTahunans;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaksi\RekapInputTahunans>
 */
class RekapInputTahunansFactory extends Factory
{
    protected $model = RekapInputTahunans::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'seq' => fake()->numberBetween(1, 100),
            'kode' => fake()->unique()->regexify('[A-Z]{3}[0-9]{3}'),
            'description' => fake()->sentence(),
            'satuan' => fake()->randomElement(['unit', 'pcs', 'kg', 'liter']),
            'master_source_id' => MasterSources::factory(),
            'master_input_id' => MasterInputs::factory(),
            'year' => fake()->year(),
            'nilai' => fake()->randomFloat(2, 0, 100000),
        ];
    }
}
