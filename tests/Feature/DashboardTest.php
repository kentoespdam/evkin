<?php

namespace Tests\Feature;

use App\Models\Master\RoleInputs;
use App\Models\Master\Roles;
use App\Models\Transaksi\LockTransaksiInputs;
use App\Models\Transaksi\TransaksiInputs;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Roles::factory()->create(['id' => 1, 'name' => 'Admin']);
        $regularRole = Roles::factory()->create(['id' => 2, 'name' => 'User']);

        // Create users
        $this->adminUser = User::factory()->create(['role_id' => $adminRole->id]);
        $this->regularUser = User::factory()->create(['role_id' => $regularRole->id]);
    }

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('data'));
    }

    public function test_admin_sees_all_stats_including_user_count(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('data.stats.totalUsers')
            ->has('data.stats.usersByRole'));
    }

    public function test_regular_user_does_not_see_admin_only_stats(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->missing('data.stats.totalUsers')
            ->missing('data.stats.usersByRole'));
    }

    public function test_dashboard_returns_expected_data_structure(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('data')
            ->has('data.stats')
            ->has('data.trends')
            ->has('data.recentActivities')
            ->has('data.aspectBreakdown')
            ->has('data.pendingPeriods')
            ->has('data.inputCompletion'));
    }

    public function test_dashboard_shows_correct_input_completion_for_current_month(): void
    {
        $currentYear = now()->year;
        $currentMonth = now()->month;

        // Create master inputs and role inputs
        $masterInput = \App\Models\Master\MasterInputs::factory()->create();
        RoleInputs::create([
            'role_id' => $this->regularUser->role_id,
            'master_input_id' => $masterInput->id,
        ]);

        // Create one input for current month
        TransaksiInputs::create([
            'periode' => now()->format('Y-m-d'),
            'year' => $currentYear,
            'month' => $currentMonth,
            'master_input_id' => $masterInput->id,
            'nilai' => 100,
            'is_locked' => false,
        ]);

        $response = $this->actingAs($this->regularUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('data.inputCompletion.total', 1)
            ->where('data.inputCompletion.completed', 1)
            ->where('data.inputCompletion.percentage', 100));
    }

    public function test_dashboard_shows_pending_periods(): void
    {
        // Create unlocked periods
        LockTransaksiInputs::create([
            'year' => 2025,
            'month' => 1,
            'is_locked' => false,
        ]);

        LockTransaksiInputs::create([
            'year' => 2025,
            'month' => 2,
            'is_locked' => true, // This should not appear
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('data.pendingPeriods.0.year', 2025)
            ->where('data.pendingPeriods.0.month', 1));
    }

    public function test_dashboard_shows_recent_activities(): void
    {
        $masterInput = \App\Models\Master\MasterInputs::factory()->create([
            'kode' => 'TEST-01',
            'description' => 'Test Indicator',
            'satuan' => 'unit',
        ]);

        TransaksiInputs::create([
            'periode' => now()->format('Y-m-d'),
            'year' => now()->year,
            'month' => now()->month,
            'master_input_id' => $masterInput->id,
            'nilai' => 999,
            'is_locked' => false,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('data.recentActivities', 1)
            ->where('data.recentActivities.0.masterInput.kode', 'TEST-01'));
    }

    public function test_dashboard_calculates_performance_trends(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('data.trends', 12)); // Should have 12 months of data
    }
}
