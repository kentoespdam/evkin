<?php

namespace Tests\Unit;

use App\Models\Master\Aspects;
use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use App\Services\ExportReportPerhitunganDetailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionMethod;
use Tests\TestCase;

class ExportReportPerhitunganDetailServiceTest extends TestCase
{
    // use RefreshDatabase;

    public function test_orders_by_master_report_seq(): void
    {
        $reportType = ReportTypes::updateOrCreate([
            'name' => 'Tipe Laporan A',
            'template_name' => 'template_a',
            'formula_performance' => 'sum',
        ]);

        $aspect = Aspects::updateOrCreate([
            'name' => 'Aspek A',
            'report_type_id' => $reportType->id,
            'max_score' => 100,
            'weight' => 5,
        ]);

        $masterReportA = MasterReports::updateOrCreate([
            'seq' => 2,
            'urut' => '0002',
            'report_type_id' => $reportType->id,
            'aspect_id' => $aspect->id,
            'desc_indicator' => 'Indikator A',
            'desc_formula' => 'Formula A',
            'unit' => 'unit',
            'weight' => 1.25,
            'formula' => 'sum',
            'formula_archivement' => 'sum',
            'with_rules' => false,
            'rules' => null,
        ]);

        $masterReportB = MasterReports::updateOrCreate([
            'seq' => 1,
            'urut' => '0001',
            'report_type_id' => $reportType->id,
            'aspect_id' => $aspect->id,
            'desc_indicator' => 'Indikator B',
            'desc_formula' => 'Formula B',
            'unit' => 'unit',
            'weight' => 2.5,
            'formula' => 'sum',
            'formula_archivement' => 'sum',
            'with_rules' => false,
            'rules' => null,
        ]);

        PerhitunganReports::updateOrCreate([
            'master_report_id' => $masterReportA->id,
            'year' => 2026,
            'month' => 1,
            'desc_indicator' => 'Indikator A',
            'formula' => 'sum',
            'formula_value' => 'A',
            'nilai' => 10,
        ]);

        PerhitunganReports::updateOrCreate([
            'master_report_id' => $masterReportB->id,
            'year' => 2026,
            'month' => 1,
            'desc_indicator' => 'Indikator B',
            'formula' => 'sum',
            'formula_value' => 'B',
            'nilai' => 20,
        ]);

        $service = new ExportReportPerhitunganDetailService(
            2026,
            1,
            $reportType->sqid,
            $aspect->sqid,
            null
        );

        $method = new ReflectionMethod($service, 'prepareData');
        $method->setAccessible(true);
        $collection = $method->invoke($service);

        $orderedIds = $collection->collection
            ->pluck('master_report_id')
            ->values()
            ->all();

        $this->assertSame([$masterReportB->id, $masterReportA->id], $orderedIds);
    }
}
