<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class InitialData extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [['name' => 'Developer'], ['name' => 'Keuangan'], ['name' => 'Renbang'], ['name' => 'Daltek'], ['name' => 'Pelayanan'], ['name' => 'SDM']];
        foreach ($roles as $role) {
            DB::table('roles')->insert($role);
        }

        DB::table('users')->insert([
            'name' => 'Development',
            'email' => 'dev@perumdamts.com',
            'password' => Hash::make('tirtasatria'),
            'role_id' => 1,
        ]);
    }
}
