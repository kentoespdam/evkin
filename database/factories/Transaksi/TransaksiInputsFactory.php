<?php

namespace Database\Factories\Transaksi;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaksi\TransaksiInputs>
 */
class TransaksiInputsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $year = $this->faker->numberBetween(2024, 2026);
        $month = $this->faker->numberBetween(1, 12);

        return [
            'year' => $year,
            'month' => $month,
            'periode' => "$year-".str_pad($month, 2, '0', STR_PAD_LEFT).'-01',
            'master_input_id' => \App\Models\Master\MasterInputs::factory(),
            'nilai' => $this->faker->numberBetween(10, 1000),
        ];
    }
}
