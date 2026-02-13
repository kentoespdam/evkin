<?php

namespace Tests\Feature;

use App\Helpers\CellHelper;
use App\Helpers\DateHelper;
use App\Models\Master\Aspects;
use App\Models\Transaksi\PerhitunganReports;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ArrayHeaderTest extends TestCase
{
    private int $year = 2026;

    private array $headerCells = [];

    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $mainHeaders = [
            new CellHelper('#', rowspan: 3),
            new CellHelper(value: 'Indikator', width: 50, rowspan: 3),
            new CellHelper(value: 'Rumus', width: 20, rowspan: 3),
            new CellHelper(value: 'Satuan', width: 15, rowspan: 3),
            new CellHelper(value: 'Bobot', width: 15, rowspan: 3),
        ];

        $monthHeaders = array_map(
            fn ($month) => new CellHelper(value: "{$month} {$this->year}", colspan: 2, rowspan: 2),
            DateHelper::$monthList
        );

        $pencapaianHeaders = [
            new CellHelper(value: 'Pencapaian Total', colspan: 2),
            new CellHelper(value: sprintf('Pencapaian Tahun %d', $this->year - 1), colspan: 2, rowspan: 2),
        ];

        $this->headerCells = [
            array_merge(
                $mainHeaders,
                $monthHeaders,
                $pencapaianHeaders,
            ),
        ];

        $this->assertTrue(true);
        Log::debug('Final Header Cells', $this->headerCells);
    }

    public function test_get_last_month(): void
    {

        $data = PerhitunganReports::query()
            ->where('year', $this->year)
            ->pluck('month')
            ->max();

        $this->assertNotNull($data);
        Log::debug('Last Month', ['month' => $data]);
    }

    public function test_grouped(): void
    {
        $reportTypeId = 1;
        $aspects = Aspects::where('report_type_id', $reportTypeId)
            ->get(['id', 'name', 'max_score', 'weight']);

        $totalNilaiMap = [];
        $data = PerhitunganReports::getPerhitunganReports(
            $this->year,
            $reportTypeId,
            '',
            false
        );

        foreach ($aspects as $aspect) {
            $grouped = $data->where(fn ($item) => $item->masterReport->aspect_id == $aspect->id)
                ->groupBy(
                    fn ($item) => sprintf('%d-%d', $item->year, $item->month)
                )->map(
                    function ($subGroup) {
                        return $subGroup->sum('nilai_indicator');
                    }
                );
            $totalNilaiMap[$aspect->id] = $grouped;
        }

        // ->map(
        //     fn($group) => $group
        //         ->groupBy(
        //             fn($item) =>
        //             sprintf("%d-%d", $item->year, $item->month)
        //         )->map(
        //             function ($subGroup) {
        //                 // $reportType = $subGroup->first()->masterReport->reportType;
        //                 return [
        //                     // "reportType" => $reportType,
        //                     "totalNilaiIndicator" => $subGroup->sum('nilai_indicator')
        //                 ];
        //             }
        //         )
        // );

        $this->assertNotNull($data);
        Log::debug('Last Month', ['month' => $totalNilaiMap]);
    }
}
