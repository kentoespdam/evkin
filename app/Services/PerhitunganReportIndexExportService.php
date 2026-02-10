<?php

namespace App\Services;

use App\Data\ExcelConfiguration;
use App\Models\Master\Aspects;
use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use Illuminate\Support\Str;

class PerhitunganReportIndexExportService extends BaseExcelExportService
{
    protected function getConfiguration(): ExcelConfiguration
    {
        return ExcelConfiguration::create();
    }

    protected function getDataQuery(array $filters)
    {
        $year = (int) ($filters['year'] ?? date('Y'));
        $reportTypeId = $this->getReportTypeId($filters['report_type_id']);

        $masterReports = MasterReports::where('report_type_id', $reportTypeId)
            ->when($filters['search'] ?? false, fn($query) => $query->where('desc_indicator', 'like', "%{$filters['search']}%"))
            ->get();

        $reports = PerhitunganReports::getPerhitunganReports($year, $reportTypeId, $filters['search'], includeLastDecember: true);
        $reportsDecemberLastYear = $this->getDecemberLastYearReports($year - 1, $reportTypeId, $filters['search']);
        $aspects = Aspects::where('report_type_id', $reportTypeId)->get();
    }

    protected function processDataRow($item, int $index): array
    {
        throw new \Exception('Not implemented');
    }

    public function generateFileName(array $filters): string
    {
        $timestamp = now()->format('Y-m-d-His');
        $year = $filters['year'];
        $reportTypeId = $this->getReportTypeId($filters['report_type_id']);

        return "perhitungan_reports_index-{$reportTypeId}-{$year}-{$timestamp}.xlsx";
    }

    private function getDefaultReportTypeSqid(): string
    {
        return ReportTypes::first()?->sqid ?? '';
    }

    private function getReportTypeId(?string $sqid = null): ?int
    {
        $sqid = $sqid ?? $this->getDefaultReportTypeSqid();

        return ReportTypes::whereSqid($sqid)->first()?->id;
    }

    private function getDecemberLastYearReports(int $year, ?int $reportTypeId, ?string $search): \Illuminate\Database\Eloquent\Collection
    {
        return PerhitunganReports::with('masterReport')
            ->where('year', $year)
            ->where('month', 12)
            ->whereHas('masterReport', fn($q) => $q->where('report_type_id', $reportTypeId))
            ->when($search, fn($q) => $q->whereHas('masterReport', fn($inner) => $inner->where('desc_indicator', 'like', "%{$search}%")))
            ->get();
    }
}
