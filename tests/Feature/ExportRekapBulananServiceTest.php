<?php

namespace Tests\Feature;

use App\Models\Master\Aspects;
use App\Models\Master\MasterInputs;
use App\Models\Master\MasterSources;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\RekapInputTahunans;
use App\Models\Transaksi\TransaksiInputs;
use App\Services\ExportRekapBulananService;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExportRekapBulananServiceTest extends TestCase
{
    private int $year = 2025;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_can_generate_excel_file_with_basic_data(): void
    {
        // Setup data
        $reportType = ReportTypes::updateOrCreate([
            'name' => 'Pertumbuhan',
            'template_name' => 'template_1',
            'formula_performance' => 'sum',
        ]);

        $aspect = Aspects::updateOrCreate([
            'name' => 'Aspek 1',
            'report_type_id' => $reportType->id,
            'formula_aspect' => 'sum',
        ]);

        $masterSource = MasterSources::updateOrCreate([
            'name' => 'Sumber Data 1',
            'kode' => 'SD001',
        ]);

        $masterInput1 = MasterInputs::updateOrCreate([
            'aspect_id' => $aspect->id,
            'master_source_id' => $masterSource->id,
            'description' => 'Master Input 1',
            'seq' => 1,
            'kode' => 'MI001',
            'satuan' => 'unit',
        ]);

        // Create monthly data for current year (hanya beberapa bulan untuk test lebih cepat)
        TransaksiInputs::updateOrCreate([
            'master_input_id' => $masterInput1->id,
            'year' => $this->year,
            'month' => 1,
            'periode' => sprintf('%d-01-01', $this->year),
            'nilai' => 101.50,
            'is_locked' => false,
        ]);

        TransaksiInputs::updateOrCreate([
            'master_input_id' => $masterInput1->id,
            'year' => $this->year,
            'month' => 2,
            'periode' => sprintf('%d-02-01', $this->year),
            'nilai' => 102.50,
            'is_locked' => false,
        ]);

        // Create yearly data for previous year
        RekapInputTahunans::updateOrCreate([
            'master_input_id' => $masterInput1->id,
            'year' => $this->year - 1,
            'nilai' => 1250.50,
            'seq' => 1,
            'kode' => 'MI001',
            'description' => 'Master Input 1',
            'satuan' => 'unit',
            'master_source_id' => $masterSource->id,
        ]);

        // Execute service
        $service = new ExportRekapBulananService($this->year);
        $filePath = $service->generateAndStore();

        // Assertions
        $this->assertFileExists($filePath);
        $this->assertStringContainsString('rekap-bulanan-', basename($filePath));
        $this->assertStringEndsWith('.xlsx', $filePath);
        $this->assertTrue(filesize($filePath) > 0);
    }
}
