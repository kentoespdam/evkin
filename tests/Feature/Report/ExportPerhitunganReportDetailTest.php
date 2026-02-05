<?php

namespace Tests\Feature\Report;

use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use App\Models\User;
use Tests\TestCase;

class ExportPerhitunganReportDetailTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_export_detail_endpoint_returns_excel_file(): void
    {
        $reportType = ReportTypes::create([
            'desc_type' => 'Test Report Type',
            'sqid' => 'test-'.time(),
        ]);

        $masterReport = MasterReports::create([
            'report_type_id' => $reportType->id,
            'desc_indicator' => 'Test Indicator',
            'unit' => 'pcs',
            'with_rules' => false,
        ]);

        PerhitunganReports::create([
            'master_report_id' => $masterReport->id,
            'year' => 2024,
            'month' => 1,
            'desc_indicator' => 'Test Indicator',
            'formula' => '=A+B',
            'formula_value' => '10',
            'nilai' => 10,
            'nilai_indicator' => 10,
            'formula_nilai_bobot' => '=nilai*0.5',
            'nilai_bobot' => 5,
            'formula_archivement' => '=nilai/target',
            'formula_archivement_value' => '0.5',
            'nilai_archivement' => 0.5,
        ]);

        $response = $this->postJson('/report/perhitungan-reports/detail/export', [
            'year' => 2024,
            'month' => 1,
            'report_type_id' => $reportType->sqid,
        ]);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->assertHeader('Content-Disposition', fn ($value) => str_contains($value, 'attachment'));
    }

    public function test_export_detail_requires_authentication(): void
    {
        $this->actingAs(null);

        $this->postJson('/report/perhitungan-reports/detail/export', [
            'year' => 2024,
            'month' => 1,
        ])->assertStatus(302)->assertRedirect('/login');
    }

    public function test_export_detail_validates_required_fields(): void
    {
        $response = $this->postJson('/report/perhitungan-reports/detail/export', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['year', 'month']);
    }

    public function test_export_detail_validates_year_range(): void
    {
        $response = $this->postJson('/report/perhitungan-reports/detail/export', [
            'year' => 1999,
            'month' => 1,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['year']);
    }

    public function test_export_detail_validates_month_range(): void
    {
        $response = $this->postJson('/report/perhitungan-reports/detail/export', [
            'year' => 2024,
            'month' => 13,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['month']);
    }

    public function test_export_detail_with_all_filters(): void
    {
        $reportType = ReportTypes::create([
            'desc_type' => 'Test Report Type',
            'sqid' => 'test-'.time(),
        ]);

        $masterReport = MasterReports::create([
            'report_type_id' => $reportType->id,
            'desc_indicator' => 'Test Indicator',
            'unit' => 'pcs',
            'with_rules' => false,
        ]);

        PerhitunganReports::create([
            'master_report_id' => $masterReport->id,
            'year' => 2024,
            'month' => 1,
            'desc_indicator' => 'Test Indicator',
            'formula' => '=A+B',
            'formula_value' => '10',
            'nilai' => 10,
            'nilai_indicator' => 10,
            'formula_nilai_bobot' => '=nilai*0.5',
            'nilai_bobot' => 5,
            'formula_archivement' => '=nilai/target',
            'formula_archivement_value' => '0.5',
            'nilai_archivement' => 0.5,
        ]);

        $response = $this->postJson('/report/perhitungan-reports/detail/export', [
            'year' => 2024,
            'month' => 1,
            'report_type_id' => $reportType->sqid,
            'search' => 'Test',
        ]);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_export_detail_returns_empty_spreadsheet_when_no_data(): void
    {
        $reportType = ReportTypes::create([
            'desc_type' => 'Test Report Type',
            'sqid' => 'test-'.time(),
        ]);

        $response = $this->postJson('/report/perhitungan-reports/detail/export', [
            'year' => 2024,
            'month' => 1,
            'report_type_id' => $reportType->sqid,
        ]);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}
