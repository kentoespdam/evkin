<?php

namespace Database\Factories\Master;

use App\Models\Master\Aspects;
use App\Models\Master\ReportTypes;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Master\Aspects>
 */
class AspectsFactory extends Factory
{
    protected $model = Aspects::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'report_type_id' => ReportTypes::factory(),
            'max_score' => fake()->numberBetween(50, 100),
            'weight' => fake()->numberBetween(1, 10),
        ];
    }
}
