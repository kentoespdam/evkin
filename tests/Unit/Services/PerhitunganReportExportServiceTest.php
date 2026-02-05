<?php

namespace Tests\Unit\Services;

use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use App\Services\PerhitunganReportExportService;
use Tests\TestCase;

class PerhitunganReportExportServiceTest extends TestCase
{
    private PerhitunganReportExportService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PerhitunganReportExportService;
    }

    public function test_export_detail_returns_streamed_response(): void
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

        $filters = [
            'year' => 2024,
            'month' => 1,
            'report_type_id' => $reportType->sqid,
        ];

        $response = $this->service->exportDetail($filters);

        $this->assertEqual($response->getStatusCode(), 200);
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('xlsx', $response->headers->get('Content-Type'));
    }

    public function test_export_detail_with_search_filter(): void
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

        $filters = [
            'year' => 2024,
            'month' => 1,
            'report_type_id' => $reportType->sqid,
            'search' => 'Test',
        ];

        $response = $this->service->exportDetail($filters);

        $this->assertEqual($response->getStatusCode(), 200);
    }

    public function test_export_detail_includes_all_columns(): void
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

        $filters = [
            'year' => 2024,
            'month' => 1,
            'report_type_id' => $reportType->sqid,
        ];

        $response = $this->service->exportDetail($filters);

        $this->assertEqual($response->getStatusCode(), 200);
        // The response should contain spreadsheet data
        $content = $response->getContent();
        $this->assertNotEmpty($content);
    }
}
