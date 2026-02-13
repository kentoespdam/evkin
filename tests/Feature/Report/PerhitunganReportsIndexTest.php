<?php

namespace Tests\Feature\Report;

use App\Models\User;
use Tests\TestCase;

class PerhitunganReportsIndexTest extends TestCase
{
    public function test_guests_are_redirected_to_login()
    {
        $this->get('/report/perhitungan-reports')->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_index()
    {
        $user = User::query()->create([
            'name' => 'Tester',
            'email' => 'tester@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user);

        $this->get(route('report.perhitungan-reports'))
            ->assertOk();
    }
}
