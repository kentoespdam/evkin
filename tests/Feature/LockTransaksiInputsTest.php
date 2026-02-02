<?php

namespace Tests\Feature;

use App\Models\Transaksi\LockTransaksiInputs;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LockTransaksiInputsTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_toggle_lock_for_period(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->patch('/transaksi/lock/2025/1', [
                'is_locked' => true,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Periode berhasil dikunci');

        $this->assertDatabaseHas('table_lock_transaksi_inputs', [
            'year' => 2025,
            'month' => 1,
            'is_locked' => true,
        ]);
    }

    public function test_cannot_upsert_transaksi_when_period_is_locked(): void
    {
        $user = User::factory()->create();

        LockTransaksiInputs::create([
            'year' => 2025,
            'month' => 1,
            'is_locked' => true,
        ]);

        // Create MasterInputs for the test
        $masterInputIds = \App\Models\Master\MasterInputs::factory()
            ->count(3)
            ->create()
            ->pluck('id')
            ->toArray();

        $response = $this->actingAs($user)
            ->post('/transaksi/inputs', [
                'year' => 2025,
                'month' => 1,
                'master_input_ids' => $masterInputIds,
                'nilais' => [100, 200, 300],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_toggle_lock_creates_lock_record_if_not_exists(): void
    {
        $user = User::factory()->create();

        $this->assertDatabaseMissing('table_lock_transaksi_inputs', [
            'year' => 2025,
            'month' => 2,
        ]);

        $response = $this->actingAs($user)
            ->patch('/transaksi/lock/2025/2', [
                'is_locked' => true,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('table_lock_transaksi_inputs', [
            'year' => 2025,
            'month' => 2,
            'is_locked' => true,
        ]);
    }

    public function test_toggle_lock_unlocks_when_already_locked(): void
    {
        $user = User::factory()->create();

        LockTransaksiInputs::create([
            'year' => 2025,
            'month' => 3,
            'is_locked' => true,
        ]);

        $response = $this->actingAs($user)
            ->patch('/transaksi/lock/2025/3', [
                'is_locked' => false,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Periode berhasil dibuka');

        $this->assertDatabaseHas('table_lock_transaksi_inputs', [
            'year' => 2025,
            'month' => 3,
            'is_locked' => false,
        ]);
    }
}
