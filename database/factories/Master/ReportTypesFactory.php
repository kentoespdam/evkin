<?php

namespace Database\Factories\Master;

use App\Models\Master\ReportTypes;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Master\ReportTypes>
 */
class ReportTypesFactory extends Factory
{
    protected $model = ReportTypes::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'template_name' => fake()->word(),
            'formula_performance' => fake()->randomElement(['sum', 'avg', 'max']),
        ];
    }
}
