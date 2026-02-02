<?php

namespace App\Helpers;

use App\Models\Master\MasterInputs;
use App\Models\Transaksi\RekapInputTahunans;
use App\Models\Transaksi\TransaksiInputs;
use Illuminate\Support\Facades\Log;

class HitungInputTahunanHelper
{
    /**
     * Calculate yearly input aggregation based on MasterInputs formulas.
     *
     * @param  int  $year  Year to calculate for
     * @return array Results in RekapInputTahunans format
     */
    public static function hitungTotalTahunan(int $year): array
    {
        try {
            $results = [];

            // Get all master inputs with their details
            $masterInputs = MasterInputs::all();

            // Get all transaction inputs for the specified year
            $transactionInputs = TransaksiInputs::where('year', $year)
                ->get()
                ->sortBy('periode');

            // Process each master input
            foreach ($masterInputs as $masterInput) {
                // Filter transaction inputs for this master input
                $itemTransactions = $transactionInputs
                    ->where('master_input_id', $masterInput->id)
                    ->values();

                // Calculate total based on formula type
                $total = self::calculateTotal($itemTransactions, $masterInput);

                // Build result array
                $results[] = [
                    'seq' => $masterInput->seq,
                    'master_input_id' => $masterInput->id,
                    'kode' => $masterInput->kode,
                    'description' => $masterInput->description,
                    'satuan' => $masterInput->satuan,
                    'master_source_id' => $masterInput->master_source_id,
                    'year' => $year,
                    'nilai' => $total,
                ];
            }

            return $results;
        } catch (\Throwable $e) {
            Log::error('Error in hitungTotalTahunan: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Calculate total based on formula type from master input.
     *
     * @param  \Illuminate\Support\Collection  $transactions  Transaction items
     * @param  MasterInputs  $masterInput  Master input definition
     * @return float Calculated total
     */
    private static function calculateTotal($transactions, MasterInputs $masterInput): float
    {
        if ($transactions->isEmpty()) {
            return 0.0;
        }

        // Determine formula type from MasterInputs.formula field
        $formulaType = strtoupper(trim($masterInput->formula ?? 'SUM'));

        return match ($formulaType) {
            'SUM' => (float) $transactions->sum('nilai'),
            'MAX' => (float) $transactions->max('nilai'),
            'MIN' => (float) $transactions->min('nilai'),
            'AVG' => (float) $transactions->avg('nilai'),
            'LAST' => (float) $transactions->last()->nilai ?? 0.0,
            'FIRST' => (float) $transactions->first()->nilai ?? 0.0,
            default => (float) $transactions->sum('nilai'), // Default to SUM
        };
    }

    /**
     * Store yearly calculation results using upsert to prevent duplicates.
     *
     * @param  array  $results  Array of calculation results
     */
    public static function storeResults(array $results): void
    {
        try {
            if (empty($results)) {
                return;
            }

            RekapInputTahunans::upsert(
                $results,
                ['kode', 'year'],
                ['seq', 'master_input_id', 'description', 'satuan', 'master_source_id', 'nilai']
            );
        } catch (\Throwable $e) {
            Log::error('Error storing HitungInputTahunan results: '.$e->getMessage());
        }
    }

    /**
     * Calculate and store yearly input totals in one operation.
     *
     * @param  int  $year  Year to process
     * @return array Stored results
     */
    public static function calculate(int $year): void
    {
        $results = self::hitungTotalTahunan($year);
        self::storeResults($results);
    }
}
