<?php

namespace App\Services\PerhitunganReport\Pupr;

use App\Helpers\FormulaPerformanceHelper;
use App\Models\Master\Aspects;
use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use Illuminate\Support\Collection;

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

    private function prepareBaseData(): void
    {
        $this->reportType = ReportTypes::whereSqid($this->reportTypeId)->first();
        $this->lastInputMonth = PerhitunganReports::query()
            ->where('year', $this->year)
            ->pluck('month')
            ->max() ?? 0;
    }

    public function getReportType(): ?ReportTypes
    {
        return $this->reportType;
    }

    public function getLastInputMonth(): int
    {
        return $this->lastInputMonth;
    }

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

    private function getMasterReports(): Collection
    {
        return MasterReports::where('report_type_id', $this->reportType->id)
            ->orderBy('aspect_id')
            ->orderBy('seq')
            ->orderBy('urut')
            ->get();
    }

    private function getReports(): Collection
    {
        return PerhitunganReports::getPerhitunganReports(
            $this->year,
            $this->reportType->id,
            $this->search,
            true
        );
    }

    private function getReportsDecemberLastYear(): Collection
    {
        return PerhitunganReports::getDecemberLastYearReports(
            $this->year - 1,
            $this->reportType->id,
            $this->search
        );
    }

    private function getAspects(): Collection
    {
        return Aspects::where('report_type_id', $this->reportType->id)
            ->get(['id', 'name', 'max_score', 'weight']);
    }

    private function prepareArchivementData(Collection $reports): Collection
    {
        return $reports
            ->filter(fn ($report) => $report->month == $this->lastInputMonth)
            ->keyBy('master_report_id')
            ->map(fn ($report) => collect([
                'master_report_id' => $report->master_report_id,
                'aspect_id' => $report->masterReport->aspect_id,
                'nilai_archivement' => $report->nilai_archivement,
                'nilai_archivement_indicator' => $report->nilai_archivement_indicator,
                'nilai_bobot_archivement' => $report->nilai_bobot_archivement,
            ]));
    }

    private function organizeData(Collection $masterReports, Collection $reportData, Collection $aspects, Collection $archivementData): array
    {
        $groupedMasterReports = $masterReports->groupBy('aspect_id');

        $groupedReports = $reportData
            ->groupBy(fn ($item) => $item->masterReport->aspect_id)
            ->map(
                fn ($aspectGroup) => $aspectGroup->groupBy('master_report_id')
                    ->map(
                        fn ($masterReportGroup) => $masterReportGroup->keyBy(fn ($item) => sprintf('%d-%d', $item->year, $item->month))
                    )
            );

        $groupedArchivementByAspect = $archivementData
            ->groupBy('aspect_id')
            ->map(
                fn ($group) => $group->keyBy('master_report_id')
            );

        $totalNilaiByAspect = [];
        $totalArchivementByAspect = [];

        foreach ($aspects as $aspect) {
            $aspectId = $aspect->id;

            $totalNilaiByAspect[$aspectId] = $reportData
                ->where(fn ($item) => $item->masterReport->aspect_id == $aspectId)
                ->groupBy(fn ($item) => sprintf('%d-%d', $item->year, $item->month))
                ->map(fn ($subGroup) => $subGroup->sum('nilai_bobot'));

            $totalArchivementByAspect[$aspectId] = $archivementData
                ->where(fn ($item) => $item['aspect_id'] == $aspectId)
                ->sum('nilai_bobot_archivement');
        }

        $totalNilaiPerformanceByYearMonth = collect($totalNilaiByAspect)
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

        $archivementTotal = collect($totalArchivementByAspect)->sum();
        $totalNilaiPerformanceByYearMonth["{$this->year}-00"]['total'] = $archivementTotal;
        $totalNilaiPerformanceByYearMonth["{$this->year}-00"]['nilaiPerformance'] = FormulaPerformanceHelper::evaluateFormulaWithVariables(
            $formulaPerformance,
            $archivementTotal
        );

        return [
            'masterReports' => $groupedMasterReports,
            'reports' => $groupedReports,
            'aspects' => $aspects,
            'groupedArchivementByAspect' => $groupedArchivementByAspect,
            'totalNilaiByAspect' => $totalNilaiByAspect,
            'totalArchivementByAspect' => $totalArchivementByAspect,
            'totalNilaiPerformanceByYearMonth' => collect($totalNilaiPerformanceByYearMonth),
        ];
    }
}
