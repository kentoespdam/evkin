<?php

namespace Database\Factories\Master;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Master\MasterInputs>
 */
class MasterInputsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'seq' => $this->faker->numberBetween(1, 100),
            'kode' => $this->faker->unique()->word(),
            'description' => $this->faker->sentence(),
            'satuan' => $this->faker->word(),
            'formula' => 'SUM',
            'aspect_id' => null,
            'master_source_id' => \App\Models\Master\MasterSources::factory(),
        ];
    }
}
