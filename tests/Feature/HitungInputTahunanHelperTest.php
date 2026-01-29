<?php

namespace Tests\Feature;

use App\Helpers\HitungInputTahunanHelper;
use App\Models\Master\MasterInputs;
use App\Models\Master\MasterSources;
use App\Models\Transaksi\TransaksiInputs;
use Tests\TestCase;

class HitungInputTahunanHelperTest extends TestCase
{
    protected MasterSources $masterSource;

    protected MasterInputs $masterInputSum;

    protected int $testYear = 2026;

    protected function setUp(): void
    {
        parent::setUp();
        $this->masterSource = MasterSources::factory()->create();

        $this->masterInputSum = MasterInputs::factory()->create([
            'seq' => 1,
            'kode' => 'INPUT_SUM_'.uniqid(),
            'description' => 'Input dengan formula SUM',
            'formula' => 'SUM',
            'master_source_id' => $this->masterSource->id,
        ]);
    }

    public function test_hitung_total_tahunan_sum_formula(): void
    {
        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 1,
            'master_input_id' => $this->masterInputSum->id,
            'nilai' => 100,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 2,
            'master_input_id' => $this->masterInputSum->id,
            'nilai' => 200,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 3,
            'master_input_id' => $this->masterInputSum->id,
            'nilai' => 150,
        ]);

        $results = HitungInputTahunanHelper::hitungTotalTahunan($this->testYear);
        $sumResult = collect($results)->firstWhere('kode', $this->masterInputSum->kode);

        $this->assertNotNull($sumResult);
        $this->assertEquals(450, $sumResult['nilai']);
    }

    public function test_hitung_total_tahunan_max_formula(): void
    {
        $masterInputMax = MasterInputs::factory()->create([
            'seq' => 2,
            'kode' => 'INPUT_MAX_'.uniqid(),
            'description' => 'Input dengan formula MAX',
            'formula' => 'MAX',
            'master_source_id' => $this->masterSource->id,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 1,
            'master_input_id' => $masterInputMax->id,
            'nilai' => 50,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 2,
            'master_input_id' => $masterInputMax->id,
            'nilai' => 300,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 3,
            'master_input_id' => $masterInputMax->id,
            'nilai' => 75,
        ]);

        $results = HitungInputTahunanHelper::hitungTotalTahunan($this->testYear);
        $maxResult = collect($results)->firstWhere('kode', $masterInputMax->kode);

        $this->assertNotNull($maxResult);
        $this->assertEquals(300, $maxResult['nilai']);
    }

    public function test_hitung_total_tahunan_min_formula(): void
    {
        $masterInputMin = MasterInputs::factory()->create([
            'seq' => 3,
            'kode' => 'INPUT_MIN_'.uniqid(),
            'description' => 'Input dengan formula MIN',
            'formula' => 'MIN',
            'master_source_id' => $this->masterSource->id,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 1,
            'master_input_id' => $masterInputMin->id,
            'nilai' => 100,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 2,
            'master_input_id' => $masterInputMin->id,
            'nilai' => 25,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 3,
            'master_input_id' => $masterInputMin->id,
            'nilai' => 75,
        ]);

        $results = HitungInputTahunanHelper::hitungTotalTahunan($this->testYear);
        $minResult = collect($results)->firstWhere('kode', $masterInputMin->kode);

        $this->assertNotNull($minResult);
        $this->assertEquals(25, $minResult['nilai']);
    }

    public function test_hitung_total_tahunan_avg_formula(): void
    {
        $masterInputAvg = MasterInputs::factory()->create([
            'seq' => 4,
            'kode' => 'INPUT_AVG_'.uniqid(),
            'description' => 'Input dengan formula AVG',
            'formula' => 'AVG',
            'master_source_id' => $this->masterSource->id,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 1,
            'master_input_id' => $masterInputAvg->id,
            'nilai' => 100,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 2,
            'master_input_id' => $masterInputAvg->id,
            'nilai' => 200,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 3,
            'master_input_id' => $masterInputAvg->id,
            'nilai' => 300,
        ]);

        $results = HitungInputTahunanHelper::hitungTotalTahunan($this->testYear);
        $avgResult = collect($results)->firstWhere('kode', $masterInputAvg->kode);

        $this->assertNotNull($avgResult);
        $this->assertEquals(200, $avgResult['nilai']);
    }

    public function test_hitung_total_tahunan_last_formula(): void
    {
        $masterInputLast = MasterInputs::factory()->create([
            'seq' => 5,
            'kode' => 'INPUT_LAST_'.uniqid(),
            'description' => 'Input dengan formula LAST',
            'formula' => 'LAST',
            'master_source_id' => $this->masterSource->id,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 1,
            'periode' => '2026-01-01',
            'master_input_id' => $masterInputLast->id,
            'nilai' => 100,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 2,
            'periode' => '2026-02-01',
            'master_input_id' => $masterInputLast->id,
            'nilai' => 200,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 12,
            'periode' => '2026-12-01',
            'master_input_id' => $masterInputLast->id,
            'nilai' => 350,
        ]);

        $results = HitungInputTahunanHelper::hitungTotalTahunan($this->testYear);
        $lastResult = collect($results)->firstWhere('kode', $masterInputLast->kode);

        $this->assertNotNull($lastResult);
        $this->assertEquals(350, $lastResult['nilai']);
    }

    public function test_store_results_creates_rekap_records(): void
    {
        $testKode = 'TEST_KODE_'.uniqid();
        $results = [
            [
                'seq' => 1,
                'kode' => $testKode,
                'description' => 'Test Description',
                'satuan' => 'unit',
                'master_source_id' => $this->masterSource->id,
                'year' => $this->testYear,
                'nilai' => 500,
            ],
        ];

        HitungInputTahunanHelper::storeResults($results);

        $this->assertDatabaseHas('rekap_input_tahunans', [
            'kode' => $testKode,
            'year' => $this->testYear,
            'nilai' => 500,
        ]);
    }

    public function test_calculate_method_executes(): void
    {
        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 1,
            'master_input_id' => $this->masterInputSum->id,
            'nilai' => 150,
        ]);

        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 2,
            'master_input_id' => $this->masterInputSum->id,
            'nilai' => 250,
        ]);

        $results = HitungInputTahunanHelper::calculate($this->testYear);

        $this->assertIsArray($results);
        $this->assertNotEmpty($results);

        $sumResultInArray = collect($results)->firstWhere('kode', $this->masterInputSum->kode);
        $this->assertNotNull($sumResultInArray);
        $this->assertEquals(400, $sumResultInArray['nilai']);
    }

    public function test_result_structure(): void
    {
        TransaksiInputs::factory()->create([
            'year' => $this->testYear,
            'month' => 1,
            'master_input_id' => $this->masterInputSum->id,
            'nilai' => 500,
        ]);

        $results = HitungInputTahunanHelper::hitungTotalTahunan($this->testYear);
        $sumResult = collect($results)->firstWhere('kode', $this->masterInputSum->kode);

        $this->assertArrayHasKey('seq', $sumResult);
        $this->assertArrayHasKey('kode', $sumResult);
        $this->assertArrayHasKey('description', $sumResult);
        $this->assertArrayHasKey('satuan', $sumResult);
        $this->assertArrayHasKey('master_source_id', $sumResult);
        $this->assertArrayHasKey('year', $sumResult);
        $this->assertArrayHasKey('nilai', $sumResult);

        $this->assertArrayNotHasKey('periode', $sumResult);
        $this->assertArrayNotHasKey('month', $sumResult);
    }
}
