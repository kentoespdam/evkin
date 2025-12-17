<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users=[
            [
                "name"=> "Keuangan",
                "email"=> "keuangan@perumdamts.com",
                "password"=> Hash::make("password"),
                "role_id"=> 2,
            ],
            [
                "name"=> "Renbang",
                "email"=> "renbang@perumdamts.com",
                "password"=> Hash::make("password"),
                "role_id"=> 3,
            ],
            [
                "name"=> "Daltek",
                "email"=> "daltek@perumdamts.com",
                "password"=> Hash::make("password"),
                "role_id"=> 4,
            ],
            [
                "name"=> "Pelayanan",
                "email"=> "pelayanan@perumdamts.com",
                "password"=> Hash::make("password"),
                "role_id"=> 5,
            ],
            [
                "name"=> "SDM",
                "email"=> "sdm@perumdamts.com",
                "password"=> Hash::make("password"),
                "role_id"=> 6,
            ],
        ];
        foreach($users as $user){
            DB::table('users')->insert($user);
        }
    }
}
