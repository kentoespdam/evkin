<?php

namespace Tests\Feature;

use App\Helpers\FormulaHelper;
use App\Models\Master\MasterReports;
use App\Models\Transaksi\PerhitunganReports;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PerhitunganTest extends TestCase
{
    private Carbon $currentDate;

    private Carbon $previousMonth;

    private Collection $masterReports;

    private Collection $transactionInputs;

    /**
     * Test calculation of report formulas with transaction inputs.
     */
    public function test_can_calculate_report_formulas_with_transaction_inputs(): void
    {
        $this->setupTestPeriods();
        $this->logTestPeriods();

        $this->loadMasterReports();
        $this->loadTransactionInputs();

        [$currentPeriodData, $previousPeriodData] = $this->prepareInputsByPeriod();

        $perhitunganData = $this->calculateReports($currentPeriodData, $previousPeriodData);
        // print_r($perhitunganData);
        $this->assertValidCalculations($perhitunganData);

        // $this->outputCalculationResults($perhitunganData);
        $this->storeData($perhitunganData);
    }

    /**
     * Set up test date periods.
     */
    private function setupTestPeriods(): void
    {
        $this->currentDate = Carbon::create(2026, 2, 1)->startOfMonth();
        $this->previousMonth = $this->currentDate->copy()->subMonth();
    }

    /**
     * Log test periods for debugging.
     */
    private function logTestPeriods(): void
    {
        echo sprintf(
            "Current Date: %s, Previous Month: %s\n",
            $this->currentDate->toDateString(),
            $this->previousMonth->toDateString()
        );
    }

    /**
     * Load master reports from database.
     */
    private function loadMasterReports(): void
    {
        $this->masterReports = MasterReports::all();
        $this->assertGreaterThan(
            0,
            $this->masterReports->count(),
            'No master reports found'
        );
    }

    /**
     * Load transaction inputs within the specified period.
     */
    private function loadTransactionInputs(): void
    {
        // DB::enableQueryLog();
        $this->transactionInputs = DB::table('transaksi_inputs AS ti')
            ->join('master_inputs AS mi', 'ti.master_input_id', '=', 'mi.id')
            ->select('mi.kode', 'ti.periode', 'ti.nilai', 'ti.month', 'ti.year')
            ->whereBetween('ti.periode', [
                $this->previousMonth->format('Y-m-d'),
                $this->currentDate->format('Y-m-d'),
            ])
            ->get();

        // dd(DB::getQueryLog());

        $this->assertGreaterThan(
            0,
            $this->transactionInputs->count(),
            'No transaction inputs found'
        );
    }

    /**
     * Prepare inputs grouped by period.
     */
    private function prepareInputsByPeriod()
    {
        $groupedInputs = $this->transactionInputs->groupBy('periode');

        $currentPeriodInputs = $groupedInputs->get(
            $this->currentDate->format('Y-m-d'),
            collect()
        );

        $previousPeriodInputs = $groupedInputs->get(
            $this->previousMonth->format('Y-m-d'),
            collect()
        );

        return [
            $currentPeriodInputs->pluck('nilai', 'kode')->all(),
            $previousPeriodInputs->pluck('nilai', 'kode')->all(),
        ];
    }

    /**
     * Calculate reports based on current period data.
     */
    private function calculateReports(array $currentPeriodData, array $previousPeriodData): array
    {
        $perhitunganData = [];

        foreach ($this->masterReports as $report) {
            $formulaValue = $this->replaceKodeWithNilai(
                $report->formula,
                $currentPeriodData,
                $previousPeriodData
            );

            $this->assertNotEmpty(
                $formulaValue,
                "Formula value should not be empty for report {$report->desc_indicator}"
            );

            $nilaiReport = FormulaHelper::evaluateFormula($formulaValue);

            $perhitunganData[] = [
                'master_report_id' => $report->id,
                'year' => $this->currentDate->format('Y'),
                'month' => $this->currentDate->format('m'),
                'desc_indicator' => $report->desc_indicator,
                'formula' => $report->formula,
                'formula_value' => $formulaValue,
                'nilai' => $nilaiReport,
            ];
        }

        return $perhitunganData;
    }

    /**
     * Replace kode placeholders with actual nilai values.
     */
    private function replaceKodeWithNilai(string $formula, array $currentPeriodData, array $previousPeriodData): string
    {
        $formulaArray = explode(' ', $formula);
        $result = array_map(function ($item) use ($currentPeriodData, $previousPeriodData) {
            if (in_array($item, ['+', '-', '*', '/', '(', ')', ','])) {
                return $item;
            }
            if (str_ends_with($item, '_Prev')) {
                $item = str_replace('_Prev', '', $item);

                return $this->replaceKode($item, $previousPeriodData);
            } else {
                return $this->replaceKode($item, $currentPeriodData);
            }
        }, $formulaArray);
        $new_formula = implode(' ', $result) . PHP_EOL;

        // return $formula;
        return $new_formula;
    }

    private function replaceKode(string $formula_item, array $arrayData): string
    {
        foreach ($arrayData as $key => $value) {
            if ($formula_item == $key) {
                return strval($value);
            }
        }

        return $formula_item;
    }

    /**
     * Assert that calculations are valid.
     */
    private function assertValidCalculations(array $perhitunganData): void
    {
        $this->assertNotEmpty(
            $perhitunganData,
            'No calculation results generated'
        );

        foreach ($perhitunganData as $data) {
            $this->assertIsNumeric(
                $data['nilai'],
                "Nilai should be numeric for report: {$data['desc_indicator']}"
            );
        }
    }

    private function storeData(array $data): void
    {
        print_r($data);
        PerhitunganReports::upsert(
            $data,
            ['master_report_id', 'year', 'month'],
            ['desc_indicator', 'formula', 'formula_value', 'nilai']
        );
    }
}
