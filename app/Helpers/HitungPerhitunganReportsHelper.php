<?php

namespace App\Helpers;

use App\Models\Master\MasterReports;
use App\Models\Transaksi\PerhitunganReports;
use App\Models\Transaksi\RekapInputTahunans;
use App\Models\Transaksi\TransaksiInputs;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class HitungPerhitunganReportsHelper
{
    /**
     * Calculate and store report calculations for a specific period.
     *
     * @param  int  $year  Year to calculate for
     * @param  int  $month  Month to calculate for
     * @return array Results in PerhitunganReports format
     */
    public static function hitungLaporanPerhitungan(int $year, int $month): array
    {
        try {
            $results = [];

            // Create period dates
            $currentPeriode = Carbon::create($year, $month, 1)->format('Y-m-d');
            $previousPeriode = Carbon::create($year, $month, 1)->subMonth()->format('Y-m-d');
            $decemberLastYear = Carbon::create($year - 1, 12, 1)->format('Y-m-d');

            // Get all master reports
            $masterReports = MasterReports::all();

            // Query current period inputs
            $currentInputs = self::getInputsByPeriode($currentPeriode);

            // Query previous period inputs
            $previousInputs = self::getInputsByPeriode($previousPeriode);

            // Query yearly recap inputs
            $yearlyInputs = self::getYearlyInputs($year);

            // Query December last year inputs
            $decemberLastYearInputs = self::getInputsByPeriode($decemberLastYear);

            // Process each master report
            foreach ($masterReports as $masterReport) {
                // Calculate nilai from formula
                $formulaValue = self::replaceKodeWithNilai(
                    $masterReport->formula ?? '',
                    $currentInputs,
                    $previousInputs
                );

                $nilai = FormulaHelper::evaluateFormula($formulaValue);

                // Calculate nilai_indicator from formula_indicator
                $nilaiIndicator = FormulaIndicatorHelper::evaluateFormula(
                    $masterReport->formula_indicator ?? '',
                    $nilai
                );

                $bobot = $masterReport->weight ?? 0;
                $formulaNilaiBobot = "( $bobot * $nilaiIndicator )";
                $nilaiBobot = FormulaHelper::evaluateFormula($formulaNilaiBobot);

                // Calculate nilai_archivement from formula_archivement
                $formulaArchivementValue = self::replaceKodeWithNilai(
                    $masterReport->formula ?? '',
                    $yearlyInputs,
                    $decemberLastYearInputs
                );

                $nilaiArchivement = FormulaHelper::evaluateFormula($formulaArchivementValue);

                // Calculate nilai_archivement_indicator
                $nilaiArchivementIndicator = FormulaIndicatorHelper::evaluateFormula(
                    $masterReport->formula_indicator ?? '',
                    $nilaiArchivement
                );

                // Build result array
                $results[] = [
                    'master_report_id' => $masterReport->id,
                    'year' => $year,
                    'month' => $month,
                    'desc_indicator' => $masterReport->desc_indicator,
                    'formula' => $masterReport->formula,
                    'formula_value' => $formulaValue,
                    'nilai' => $nilai,
                    'nilai_indicator' => $nilaiIndicator,
                    'formula_nilai_bobot' => $formulaNilaiBobot,
                    'nilai_bobot' => $nilaiBobot,
                    'formula_archivement' => $masterReport->formula,
                    'formula_archivement_value' => $formulaArchivementValue,
                    'nilai_archivement' => $nilaiArchivement,
                    'nilai_archivement_indicator' => $nilaiArchivementIndicator,
                ];
            }

            return $results;
        } catch (\Throwable $e) {
            Log::error('Error in hitungLaporanPerhitungan: ' . $e->getMessage(), [
                'year' => $year,
                'month' => $month,
                'trace' => $e->getTraceAsString(),
            ]);

            return [];
        }
    }

    /**
     * Get transaction inputs for a specific period as kode => nilai pairs.
     *
     * @param  string  $periode  Period in Y-m-d format
     * @return array Kode => nilai pairs
     */
    private static function getInputsByPeriode(string $periode): array
    {
        return TransaksiInputs::where('periode', $periode)
            ->with('masterInput')
            ->get()
            ->pluck('nilai', 'masterInput.kode')
            ->all();
    }

    /**
     * Get yearly recap inputs as kode => nilai pairs.
     *
     * @param  int  $year  Year to get inputs for
     * @return array Kode => nilai pairs
     */
    private static function getYearlyInputs(int $year): array
    {
        return RekapInputTahunans::where('year', $year)
            ->get()
            ->pluck('nilai', 'kode')
            ->all();
    }

    /**
     * Replace kode tokens in formula with actual values.
     *
     * @param  string  $formula  Original formula string
     * @param  array  $currentInputs  Current period kode => nilai pairs
     * @param  array  $previousInputs  Previous period kode => nilai pairs
     * @return string Formula with values substituted
     */
    private static function replaceKodeWithNilai(string $formula, array $currentInputs, array $previousInputs): string
    {
        if (empty($formula)) {
            return '';
        }

        // Split formula by spaces
        $tokens = explode(' ', $formula);

        // Replace each token
        $replacedTokens = array_map(function ($token) use ($currentInputs, $previousInputs) {
            // Math operators - leave as-is
            if (in_array($token, ['+', '-', '*', '/', '(', ')', ','])) {
                return $token;
            }

            // Check if token ends with _Prev suffix
            if (str_ends_with($token, '_Prev')) {
                $kode = substr($token, 0, -5); // Remove '_Prev' suffix

                return self::replaceKode($kode, $previousInputs);
            }

            // Default: check in current inputs
            return self::replaceKode($token, $currentInputs);
        }, $tokens);

        // Join back with spaces
        return implode(' ', $replacedTokens);
    }

    /**
     * Replace kode tokens in formula with actual values for archivement calculation.
     * @param array $inputs Kode => nilai pairs
     * @param string $kode Kode to replace
     * @return string Replaced value or original kode if not found
     */
    private static function replaceKode(string $kode, array $inputs): string
    {
        if (empty($inputs)) {
            return $kode;
        }
        foreach ($inputs as $key => $value) {
            if ($key === $kode) {
                return (string) $value;
            }
        }
        return $kode;
    }

    /**
     * Store calculation results using upsert to prevent duplicates.
     *
     * @param  array  $results  Array of calculation results
     */
    public static function storeResults(array $results): void
    {
        try {
            if (empty($results)) {
                return;
            }

            PerhitunganReports::upsert(
                $results,
                ['master_report_id', 'year', 'month'],
                [
                    'desc_indicator',
                    'formula',
                    'formula_value',
                    'nilai',
                    'nilai_indicator',
                    'formula_nilai_bobot',
                    'nilai_bobot',
                    'formula_archivement',
                    'formula_archivement_value',
                    'nilai_archivement',
                    'nilai_archivement_indicator',
                ]
            );
        } catch (\Throwable $e) {
            Log::error('Error storing HitungPerhitunganReports results: ' . $e->getMessage());
        }
    }

    /**
     * Calculate and store report calculations in one operation.
     *
     * @param  int  $year  Year to process
     * @param  int  $month  Month to process
     * @return array Stored results
     */
    public static function calculate(int $year, int $month): void
    {
        $results = self::hitungLaporanPerhitungan($year, $month);
        self::storeResults($results);
    }
}
