<?php

namespace Database\Seeders;

use App\Models\Transaksi\LockTransaksiInputs;
use Illuminate\Database\Seeder;

class LockTransaksiInputsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LockTransaksiInputs::factory()->count(12)->create();
    }
}
