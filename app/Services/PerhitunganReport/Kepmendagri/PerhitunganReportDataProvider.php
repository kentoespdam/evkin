<?php

namespace App\Services\PerhitunganReport\Kepmendagri;

use App\Helpers\FormulaHelper;
use App\Helpers\FormulaPerformanceHelper;
use App\Models\Master\Aspects;
use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use App\Models\Transaksi\RekapInputTahunans;
use Illuminate\Support\Collection;

/**
 * Fetches and organises all data required for the Perhitungan Kepmendagri report.
 */
class PerhitunganReportDataProvider
{
    private int $year;

    private string $reportTypeId;

    private ?string $search;

    private ?ReportTypes $reportType = null;

    private int $lastInputMonth;

    public function __construct(int $year, string $reportTypeId, ?string $search = null)
    {
        $this->year = $year;
        $this->reportTypeId = $reportTypeId;
        $this->search = $search;
        $this->prepareBaseData();
    }

    /**
     * Load basic data: report type and last input month.
     */
    private function prepareBaseData(): void
    {
        $this->reportType = ReportTypes::whereSqid($this->reportTypeId)->first();
        $this->lastInputMonth = PerhitunganReports::query()
            ->where('year', $this->year)
            ->pluck('month')
            ->max() ?? 0;
    }

    /**
     * Get the report type model.
     */
    public function getReportType(): ?ReportTypes
    {
        return $this->reportType;
    }

    /**
     * Get the last month for which input exists.
     */
    public function getLastInputMonth(): int
    {
        return $this->lastInputMonth;
    }

    /**
     * Retrieve and organise all report data.
     */
    public function getData(): array
    {
        $masterReports = $this->getMasterReports();
        $reports = $this->getReports();
        $archivementData = $this->prepareArchivementData($reports);
        $reportsDecemberLastYear = $this->getReportsDecemberLastYear();
        $reportData = $reports->merge($reportsDecemberLastYear);
        $aspects = $this->getAspects();

        return $this->organizeData(
            $masterReports,
            $reportData,
            $aspects,
            $archivementData
        );
    }

    /**
     * Get master reports ordered by aspect, seq, urut.
     */
    private function getMasterReports(): Collection
    {
        return MasterReports::where('report_type_id', $this->reportType->id)
            ->orderBy('aspect_id')
            ->orderBy('seq')
            ->orderBy('urut')
            ->get();
    }

    /**
     * Get all PerhitunganReports for the current year and report type.
     */
    private function getReports(): Collection
    {
        return PerhitunganReports::getPerhitunganReports(
            $this->year,
            $this->reportType->id,
            $this->search,
            true
        );
    }

    /**
     * Get December reports from the previous year.
     */
    private function getReportsDecemberLastYear(): Collection
    {
        return PerhitunganReports::getDecemberLastYearReports(
            $this->year - 1,
            $this->reportType->id,
            $this->search
        );
    }

    /**
     * Get RekapInputTahunans for the current year and report type.
     */
    private function getRekapInputTahunans(): Collection
    {
        return RekapInputTahunans::where('year', $this->year)
            ->where('report_type_id', $this->reportType->id)
            ->get();
    }

    /**
     * Get all aspects for the current report type.
     */
    private function getAspects(): Collection
    {
        return Aspects::where('report_type_id', $this->reportType->id)
            ->get(['id', 'name', 'max_score', 'weight']);
    }

    /**
     * Prepare achievement data keyed by master report and aspect.
     */
    private function prepareArchivementData(Collection $reports): Collection
    {
        return $reports
            ->filter(fn ($report) => $report->month == $this->lastInputMonth)
            ->keyBy('master_report_id')
            ->map(fn ($report) => [
                'master_report_id' => $report->master_report_id,
                'aspect_id' => $report->masterReport->aspect_id,
                'nilai_archivement' => $report->nilai_archivement,
                'nilai_archivement_indicator' => $report->nilai_archivement_indicator,
            ]);
    }

    /**
     * Organise raw data into a structured array for the Excel builder.
     */
    private function organizeData(
        Collection $masterReports,
        Collection $reportData,
        Collection $aspects,
        Collection $archivementData
    ): array {
        $groupedMasterReports = $masterReports->groupBy('aspect_id');

        $groupedReports = $reportData
            ->groupBy(fn ($item) => $item->masterReport->aspect_id)
            ->map(fn ($aspectGroup) => $aspectGroup->groupBy('master_report_id')
                ->map(fn ($masterReportGroup) => $masterReportGroup->keyBy(fn ($item) => sprintf('%d-%d', $item->year, $item->month))));

        $groupedArchivementByAspect = $archivementData
            ->groupBy('aspect_id')
            ->map(fn ($group) => $group->keyBy('master_report_id'));

        $totalNilaiByAspect = [];
        $totalArchivementByAspect = [];
        $totalNilaiKinerjaByAspect = [];
        $totalNilaiArchivementByAspect = [];

        foreach ($aspects as $aspect) {
            $aspectId = $aspect->id;
            $maxScore = $aspect->max_score ?? 0;
            $weight = $aspect->weight ?? 0;

            $grouped = $reportData
                ->where(fn ($item) => $item->masterReport->aspect_id == $aspectId)
                ->groupBy(fn ($item) => sprintf('%d-%d', $item->year, $item->month))
                ->map(fn ($subGroup) => $subGroup->sum('nilai_indicator'));

            $groupedArchivement = $archivementData
                ->where(fn ($item) => $item['aspect_id'] == $aspectId)
                ->sum('nilai_archivement_indicator');

            $totalNilaiByAspect[$aspectId] = $grouped;
            $totalArchivementByAspect[$aspectId] = $groupedArchivement;

            $totalNilaiKinerjaByAspect[$aspectId] = $grouped
                ->map(function ($item) use ($maxScore, $weight) {
                    $formula = $item && $item > 0 ? sprintf('( %d / %d ) * %d', $item, $maxScore, $weight) : '0';

                    return FormulaHelper::evaluateFormula($formula);
                });

            $formulaArchivement = $groupedArchivement && $groupedArchivement > 0
                ? sprintf('( %d / %d ) * %d', $groupedArchivement, $maxScore, $weight)
                : '0';
            $totalNilaiArchivementByAspect[$aspectId] = FormulaHelper::evaluateFormula($formulaArchivement);
        }

        // Aggregate total performance by year-month
        $totalNilaiPerformanceByYearMonth = collect($totalNilaiKinerjaByAspect)
            ->reduce(function ($carry, $nilaiKinerjaByYearMonth) {
                foreach ($nilaiKinerjaByYearMonth as $yearMonth => $nilaiKinerja) {
                    if (! isset($carry[$yearMonth])) {
                        $carry[$yearMonth] = ['total' => 0];
                    }
                    $carry[$yearMonth]['total'] += $nilaiKinerja;
                }

                return $carry;
            }, []);

        $formulaPerformance = $this->reportType->formula_performance ?? '';
        foreach ($totalNilaiPerformanceByYearMonth as $yearMonth => $data) {
            $nilaiPerformance = FormulaPerformanceHelper::evaluateFormulaWithVariables($formulaPerformance, $data['total']);
            $totalNilaiPerformanceByYearMonth[$yearMonth]['nilaiPerformance'] = $nilaiPerformance;
        }

        $archivementTotal = collect($totalNilaiArchivementByAspect)->sum();
        $totalNilaiPerformanceByYearMonth["{$this->year}-00"]['total'] = $archivementTotal;
        $totalNilaiPerformanceByYearMonth["{$this->year}-00"]['nilaiPerformance'] = FormulaPerformanceHelper::evaluateFormulaWithVariables($formulaPerformance, $archivementTotal);

        return [
            'masterReports' => $groupedMasterReports,
            'reports' => $groupedReports,
            'aspects' => $aspects,
            'groupedArchivement' => $groupedArchivementByAspect,
            'totalNilaiByAspect' => $totalNilaiByAspect,
            'totalArchivementByAspect' => $totalArchivementByAspect,
            'totalNilaiKinerjaByAspect' => $totalNilaiKinerjaByAspect,
            'totalNilaiArchivementByAspect' => $totalNilaiArchivementByAspect,
            'totalNilaiPerformanceByYearMonth' => collect($totalNilaiPerformanceByYearMonth),
        ];
    }
}
