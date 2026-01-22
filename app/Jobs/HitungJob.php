<?php

namespace App\Jobs;

use App\Helpers\FormulaHelper;
use App\Helpers\FormulaIndicatorHelper;
use App\Models\Master\MasterReports;
use App\Models\Transaksi\PerhitunganReports;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HitungJob implements ShouldQueue
{
    use Queueable, Dispatchable;

    private Carbon $currentDate;

    private Carbon $previousMonth;

    private Collection $masterReports;

    private Collection $transactionInputs;

    private int $year;

    private int $month;

    /**
     * Create a new job instance.
     */
    public function __construct(int $year, int $month)
    {
        $this->year = $year;
        $this->month = $month;
        $this->currentDate = Carbon::create($year, $month, 1)->startOfMonth();
        $this->previousMonth = $this->currentDate->copy()->subMonth();
        $this->masterReports = MasterReports::all();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::debug("Starting HitungJob for {$this->year}-{$this->month}");
        $this->loadTransactionInputs();

        if ($this->transactionInputs->isEmpty())
            return;

        [$currentPeriodData, $previousPeriodData] = $this->prepareInputsByPeriod();

        $perhitunganData = $this->calculateReports($currentPeriodData, $previousPeriodData);

        $this->storeData($perhitunganData);
    }

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
    }

    private function prepareInputsByPeriod(): Collection
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

        return collect([
            $currentPeriodInputs->pluck('nilai', 'kode')->all(),
            $previousPeriodInputs->pluck('nilai', 'kode')->all(),
        ]);
    }

    private function calculateReports(array $currentPeriodData, array $previousPeriodData)
    {
        $results = collect();

        foreach ($this->masterReports as $report) {
            $formulaValue = $this->replaceKodeWithNilai(
                $report->formula,
                $currentPeriodData,
                $previousPeriodData
            );


            $nilaiReport = FormulaHelper::evaluateFormula($formulaValue);
            $formulaIndicator = $report->formula_indicator !== null ? $report->formula_indicator : '';
            $nilaiIndicator = FormulaIndicatorHelper::evaluateFormula(
                $formulaIndicator,
                $nilaiReport
            );
            Log::debug("Evaluating formula for report ID {$report->id}: {$formulaValue}");
            Log::debug("Result nilai: {$nilaiReport}, nilai indicator: {$nilaiIndicator}");

            $results->push([
                'master_report_id' => $report->id,
                'year' => $this->year,
                'month' => $this->month,
                'desc_indicator' => $report->desc_indicator,
                'formula' => $report->formula,
                'formula_value' => $formulaValue,
                'nilai' => $nilaiReport,
                'nilai_indicator' => $nilaiIndicator,
            ]);
        }

        return $results->toArray();
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
        if (empty($arrayData)) {
            return $formula_item;
        }
        foreach ($arrayData as $key => $value) {
            if ($formula_item == $key) {
                return strval($value);
            }
        }

        return $formula_item;
    }

    private function storeData(array $data): void
    {
        PerhitunganReports::upsert(
            $data,
            ['master_report_id', 'year', 'month'],
            ['desc_indicator', 'formula', 'formula_value', 'nilai']
        );
    }
}
