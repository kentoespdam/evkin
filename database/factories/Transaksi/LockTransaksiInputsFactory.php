<?php

namespace Database\Factories\Transaksi;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaksi\LockTransaksiInputs>
 */
class LockTransaksiInputsFactory extends Factory
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
            'is_locked' => $this->faker->boolean(20),
        ];
    }
}
