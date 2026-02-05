<?php

namespace Tests\Feature\Report;

use App\Jobs\ProcessExportJob;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ExportPerhitunganReportIndexTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_export_index_queues_job(): void
    {
        Queue::fake();

        $response = $this->postJson('/report/perhitungan-reports/export', [
            'year' => 2024,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'export_id',
            'message',
        ]);

        Queue::assertPushed(ProcessExportJob::class);
    }

    public function test_export_index_requires_authentication(): void
    {
        $this->post('/logout');

        $this->postJson('/report/perhitungan-reports/export', [
            'year' => 2024,
        ])->assertStatus(401);
    }

    public function test_export_index_validates_required_fields(): void
    {
        $response = $this->postJson('/report/perhitungan-reports/export', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['year']);
    }

    public function test_export_index_validates_year_range(): void
    {
        $response = $this->postJson('/report/perhitungan-reports/export', [
            'year' => 1999,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['year']);
    }

    public function test_export_status_returns_not_found_for_invalid_id(): void
    {
        $response = $this->getJson('/report/perhitungan-reports/export/invalid-id/status');

        $response->assertStatus(404);
    }
}
