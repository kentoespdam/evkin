<?php

namespace Database\Factories\Master;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Master\Roles>
 */
class RolesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roles = [
            'Developer',
            'Keuangan',
            'Renbang',
            'Daltek',
            'Pelayanan',
            'SDM',
        ];

        return [
            'name' => fake()->randomElement($roles),
        ];
    }
}
