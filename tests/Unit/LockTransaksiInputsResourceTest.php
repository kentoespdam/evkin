<?php

namespace Tests\Unit;

use App\Http\Resources\LockTransaksiInputsResource;
use App\Models\Transaksi\LockTransaksiInputs;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class LockTransaksiInputsResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_serializes_lock_transaksi_inputs(): void
    {
        $lock = LockTransaksiInputs::factory()->create([
            'year' => 2026,
            'month' => 1,
            'is_locked' => true,
        ]);

        $resource = new LockTransaksiInputsResource($lock);

        $data = $resource->toArray(new Request);

        $this->assertSame($lock->sqid, $data['id']);
        $this->assertSame(2026, $data['year']);
        $this->assertSame(1, $data['month']);
        $this->assertTrue($data['isLocked']);
    }
}
