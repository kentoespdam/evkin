<?php

namespace Database\Seeders;

use App\Models\Master\ReportTypes;
use Illuminate\Database\Seeder;

class ReportTypesSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'Kepmendagri',
            'PUPR',
        ];

        foreach ($types as $type) {
            ReportTypes::create([
                'name' => $type,
            ]);
        }
    }
}
