<?php

namespace Database\Factories\Transaksi;

use App\Models\Master\MasterInputs;
use App\Models\Transaksi\TransaksiInputs;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaksi\TransaksiInputs>
 */
class TransaksiInputsFactory extends Factory
{
    protected $model = TransaksiInputs::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $year = fake()->year();
        $month = fake()->numberBetween(1, 12);
        $periode = sprintf('%d-%02d-01', $year, $month); // Format as full date

        return [
            'periode' => $periode,
            'year' => $year,
            'month' => $month,
            'master_input_id' => MasterInputs::factory(),
            'nilai' => fake()->randomFloat(2, 0, 10000),
            'is_locked' => fake()->boolean(),
        ];
    }
}
