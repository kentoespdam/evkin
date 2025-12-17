<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MasterSourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            'Laba Rugi',
            'Neraca',
            'Neraca (Rinci) + LR',
            'Sikompak',
            'Proyeksi Data BPS',
            'Neraca Air',
            'NRW',
            'Humas',
            'SDM',
            'BPS',
            'Permenkes 2/2023',
            'Neraca Air (Jam Layanan)',
            'Neraca Air (Tekanan)',
            'Neraca Air (Tera Meter)',
            'Laba Rugi (Rinci)/SDM',
            'Laba Rugi (Rinci)',
        ];
        foreach ($sources as $source) {
            DB::table('master_sources')->insert([
                'name' => $source,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
