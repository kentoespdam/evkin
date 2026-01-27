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
    use Dispatchable, Queueable;

    private Carbon $currentDate;

    private Carbon $previousMonth;

    private Collection $masterReports;

    private Collection $transactionInputs;

    private Collection $sumTransactionInputs;

    private Collection $perhitunganDesLastYear;

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

        if ($this->transactionInputs->isEmpty()) {
            return;
        }

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

        $this->sumTransactionInputs = DB::table('transaksi_inputs AS ti')
            ->join('master_inputs AS mi', 'ti.master_input_id', '=', 'mi.id')
            ->select('mi.kode', DB::raw('SUM(ti.nilai) as nilai'))
            ->where('ti.year', $this->year)
            ->groupBy('mi.kode')
            ->get()
            ->pluck('nilai', 'kode');

        $this->perhitunganDesLastYear = DB::table('transaksi_inputs AS ti')
            ->join('master_inputs AS mi', 'ti.master_input_id', '=', 'mi.id')
            ->select('mi.kode', DB::raw('SUM(ti.nilai) as nilai'))
            ->where(
                'ti.periode',
                Carbon::create($this->year - 1, 12, 1)->startOfMonth()->format('Y-m-d')
            )
            ->groupBy('mi.kode')
            ->get()
            ->pluck('nilai', 'kode');
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
                $previousPeriodData,
            );

            $nilaiReport = FormulaHelper::evaluateFormula($formulaValue);
            $formulaIndicator = $report->formula_indicator !== null ? $report->formula_indicator : '';
            $nilaiIndicator = FormulaIndicatorHelper::evaluateFormula(
                $formulaIndicator,
                $nilaiReport
            );

            $formulaArchivementValue = $this->replaceKodeArchivementWithNilai(
                $report->id,
                $report->formula_archivement,
                $currentPeriodData,
                $this->perhitunganDesLastYear->all(),
                $this->sumTransactionInputs->all(),
            );
            $nilaiArchivement = FormulaHelper::evaluateFormula($formulaArchivementValue);

            // Log::debug("Calculating Report ID {$report->id}: Formula Archivement after replacement: {$formulaArchivementValue}");

            $results->push([
                'master_report_id' => $report->id,
                'year' => $this->year,
                'month' => $this->month,
                'desc_indicator' => $report->desc_indicator,
                'formula' => $report->formula,
                'formula_value' => $formulaValue,
                'nilai' => $nilaiReport,
                'nilai_indicator' => $nilaiIndicator,
                'formula_archivement' => $report->formula_archivement ?? '',
                'formula_archivement_value' => $formulaArchivementValue ?? 0.0,
                'nilai_archivement' => $nilaiArchivement ?? 0.0,
            ]);

            Log::debug($results->toJson());
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
        $new_formula = implode(' ', $result).PHP_EOL;

        // return $formula;
        return $new_formula;
    }

    private function replaceKodeArchivementWithNilai(
        int $masterId,
        string $formula,
        array $currentPeriodData,
        array $previousPeriodData,
        array $sumTransactionData
    ): string {
        $formulaArray = explode(' ', $formula);
        $result = array_map(function ($item) use ($currentPeriodData, $previousPeriodData, $sumTransactionData) {
            if (in_array($item, ['+', '-', '*', '/', '(', ')', ','])) {
                return $item;
            }
            if (str_ends_with($item, '_SUM')) {
                $item = str_replace('_SUM', '', $item);

                return $this->replaceKode($item, $sumTransactionData);
            } elseif (str_ends_with($item, '_Prev')) {
                $item = str_replace('_Prev', '', $item);

                return $this->replaceKode($item, $previousPeriodData);
            } else {
                return $this->replaceKode($item, $currentPeriodData);
            }
        }, $formulaArray);
        $new_formula = implode(' ', $result).PHP_EOL;

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
            [
                'desc_indicator',
                'formula',
                'formula_value',
                'nilai',
                'nilai_indicator',
                'formula_archivement',
                'formula_archivement_value',
                'nilai_archivement',
            ]
        );
    }
}
