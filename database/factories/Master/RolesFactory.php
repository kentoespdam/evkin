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
        return [
            [
                'name' => 'Developer',
            ],
            [
                'name' => 'Keuangan',
            ],
            [
                'name' => 'Renbang',
            ],
            [
                'name' => 'Daltek',
            ],
            [
                'name' => 'Pelayanan',
            ],
            [
                'name' => 'SDM',
            ],
        ];
    }
}
