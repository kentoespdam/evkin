<?php

namespace Tests\Feature;

use App\Models\Master\MasterReports;
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

        $this->assertValidCalculations($perhitunganData);

        $this->outputCalculationResults($perhitunganData);
    }

    /**
     * Set up test date periods.
     */
    private function setupTestPeriods(): void
    {
        $this->currentDate = Carbon::create(2026, 1, 1)->startOfMonth();
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
        $this->transactionInputs = DB::table('transaksi_inputs AS ti')
            ->join('master_inputs AS mi', 'ti.master_input_id', '=', 'mi.id')
            ->select('mi.kode', 'ti.periode', 'ti.nilai', 'ti.month', 'ti.year')
            ->whereBetween('ti.periode', [
                $this->previousMonth->format('Y-m-d'),
                $this->currentDate->format('Y-m-d'),
            ])
            ->get();

        $this->assertGreaterThan(
            0,
            $this->transactionInputs->count(),
            'No transaction inputs found'
        );
    }

    /**
     * Prepare inputs grouped by period.
     */
    private function prepareInputsByPeriod(): array
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
            $this->buildKodeNilaiMap($currentPeriodInputs),
            $this->buildKodeNilaiMap($previousPeriodInputs),
        ];
    }

    /**
     * Build kode => nilai map from inputs.
     */
    private function buildKodeNilaiMap(Collection $inputs): array
    {
        $data = $inputs->pluck('nilai', 'kode')->all();
        $totalNilai = array_reduce($data, function ($carry, $item) {
            // return $carry + $item[0];
            return $carry + $item;
        }, 0);
        return [
            "data" => $data,
            "nilai" => $totalNilai
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
                "Formula value should not be empty for report {$report->descIndicator}"
            );

            $nilaiReport = $this->evaluateFormula($formulaValue);

            $perhitunganData[] = [
                'master_report_id' => $report->id,
                'periode' => $this->currentDate->format('Y-m-d'),
                'year' => $this->currentDate->format('Y'),
                'month' => $this->currentDate->format('m'),
                'descIndicator' => $report->descIndicator,
                'formula' => $report->formula,
                'formula_value' => $formulaValue,
                'nilai' => round($nilaiReport, 2),
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
        $result = array_map(function ($item) use (&$formula, $currentPeriodData, $previousPeriodData) {
            if (in_array($item, ['+', '-', '*', '/', '(', ')', ','])) {
                return $item;
            }
            if (str_ends_with($item, '_Prev')) {
                $item = str_replace('_Prev', '', $item);
                return $this->replaceKode($item, $previousPeriodData['data']);
            } else {
                return $this->replaceKode($item, $currentPeriodData['data']);
            }
        }, $formulaArray);
        $new_formula = implode(' ', $result) . PHP_EOL;

        // return $formula;
        return $new_formula;
    }

    private function replaceKode(string $formula_item, array $arrayData, ): string
    {
        foreach ($arrayData as $key => $value) {
            if ($formula_item == $key) {
                return strval($value);
            }
        }
        return $formula_item;
    }

    /**
     * Safely evaluate mathematical formula.
     */
    private function evaluateFormula(string $formula): float
    {
        try {
            // Remove any dangerous characters and evaluate
            $safeFormula = preg_replace('/[^0-9+\-*\/()., ]/', '', $formula);
            return eval ("return {$safeFormula};");
        } catch (\Throwable $e) {
            return 0;
        }
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
                "Nilai should be numeric for report: {$data['descIndicator']}"
            );
        }
    }

    /**
     * Output calculation results for debugging.
     */
    private function outputCalculationResults(array $perhitunganData): void
    {
        echo "\nCalculation Results:\n";
        echo str_repeat('-', 80) . "\n";

        foreach ($perhitunganData as $data) {
            echo sprintf(
                "Report: %s\nFormula: %s\nValue: %s\nResult: %.2f\n%s\n",
                $data['descIndicator'],
                $data['formula'],
                $data['formula_value'],
                $data['nilai'],
                str_repeat('-', 40)
            );
        }
    }
}