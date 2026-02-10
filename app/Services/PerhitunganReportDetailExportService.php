<?php

namespace App\Services;

use App\Data\ExcelConfiguration;
use App\Helpers\ExcelStyleManager;
use App\Helpers\CellHelper;
use App\Models\Master\Aspects;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PerhitunganReportDetailExportService extends BaseExcelExportService
{
    protected function getConfiguration(): ExcelConfiguration
    {
        return ExcelConfiguration::create()
            ->withHeaders([
                new CellHelper(value: '#', width: 6),
                new CellHelper(value: 'Periode', width: 15),
                new CellHelper(value: 'Indikator', width: 30),
                new CellHelper(value: 'Rumus', width: 35),
                new CellHelper(value: 'Rumus Value', width: 25),
                new CellHelper(value: 'Satuan', width: 15),
                new CellHelper(value: 'Nilai', width: 18, format: '0.00', alignment: 'right'),
                new CellHelper(value: 'Nilai Indikator', width: 18, format: '0.00', alignment: 'right'),
                new CellHelper(value: 'Rumus Bobot', width: 20),
                new CellHelper(value: 'Nilai Bobot', width: 15, format: '0.00', alignment: 'right'),
                new CellHelper(value: 'Rumus Pencapaian', width: 25),
                new CellHelper(value: 'Rumus Pencapaian Value', width: 25),
                new CellHelper(value: 'Nilai Pencapaian', width: 18, format: '0.00', alignment: 'right'),
            ])
            ->withMonospaceColumns([4, 5, 9, 12]) // Formula columns
            ->withNumberColumns([7, 8, 10, 13]) // Numeric columns
            ->withRightAlignColumns([7, 8, 10, 13]) // Right aligned columns
            ->withConditionalFormatting([
                [
                    'column' => 13, // Nilai Pencapaian
                    'condition' => '>',
                    'value' => 80,
                    'style' => [
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'color' => ['rgb' => 'C6EFCE'],
                        ],
                    ],
                ],
            ])
            ->withSheetTitle('Detail Perhitungan')
            ->withZebraStriping(true)
            ->withOrientation('landscape')
            ->withMaxRowsPerSheet(100000)
            ->withChunkSize(1000)
            ->withDocumentProperties([
                'subject' => 'Perhitungan Reports Export',
                'keywords' => 'perhitungan, reports, export, excel',
                'category' => 'Reports',
            ]);
    }

    protected function getDataQuery(array $filters)
    {
        $query = PerhitunganReports::with('masterReport')
            ->where('year', $filters['year'])
            ->where('month', $filters['month']);

        if (!empty($filters['report_type_id'])) {
            $reportTypeId = $this->getReportTypeId($filters['report_type_id']);
            if ($reportTypeId) {
                $query->whereHas('masterReport', fn($q) => $q->where('report_type_id', $reportTypeId));
            }
        }

        if (!empty($filters['aspect_id'])) {
            $aspectId = $this->getAspectId($filters['aspect_id']);
            if ($aspectId) {
                $query->whereHas('masterReport', fn($q) => $q->where('aspect_id', $aspectId));
            }
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('desc_indicator', 'LIKE', "%{$search}%")
                    ->orWhereHas('masterReport', function ($q) use ($search) {
                        $q->where('desc_indicator', 'LIKE', "%{$search}%");
                    });
            });
        }

        return $query->orderBy('desc_indicator');
    }

    protected function processDataRow($report, int $index): array
    {
        return [
            $index,
            "{$report->year}-{$report->month}",
            $report->desc_indicator,
            $report->formula,
            $report->formula_value,
            $report->masterReport?->unit,
            $report->nilai,
            $report->nilai_indicator,
            $report->formula_nilai_bobot,
            $report->nilai_bobot,
            $report->formula_archivement,
            $report->formula_archivement_value,
            $report->nilai_archivement,
        ];
    }

    public function generateFileName(array $filters): string
    {
        $timestamp = now()->format('Y-m-d-His');
        $year = $filters['year'];
        $month = str_pad($filters['month'], 2, '0', STR_PAD_LEFT);

        $fileName = "perhitungan-reports-{$year}-{$month}-{$timestamp}";

        if (!empty($filters['report_type_id'])) {
            $reportType = ReportTypes::whereSqid($filters['report_type_id'])->first();
            if ($reportType) {
                $fileName .= '-' . Str::slug($reportType->name);
            }
        }

        return $fileName . '.xlsx';
    }

    // Legacy method for backward compatibility
    public function exportDetail(array $filters): StreamedResponse
    {
        return $this->exportData($filters);
    }

    public function generateAndStoreIndex(array $filters, string $filePath): void
    {
        $year = $filters['year'];
        $reportTypeId = $this->getReportTypeId($filters['report_type_id'] ?? null);
        $aspectId = !empty($filters['aspect_id']) ? $this->getAspectId($filters['aspect_id']) : null;
        $search = $filters['search'] ?? null;

        // Get all reports for the year
        $query = PerhitunganReports::with('masterReport')
            ->where('year', $year);

        if ($reportTypeId) {
            $query->whereHas('masterReport', fn($q) => $q->where('report_type_id', $reportTypeId));
        }

        if ($aspectId) {
            $query->whereHas('masterReport', fn($q) => $q->where('aspect_id', $aspectId));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('desc_indicator', 'LIKE', "%{$search}%")
                    ->orWhereHas('masterReport', function ($q) use ($search) {
                        $q->where('desc_indicator', 'LIKE', "%{$search}%");
                    });
            });
        }

        $reports = $query->orderBy('desc_indicator')->get();

        // Group reports by indicator and organize by month
        $groupedReports = $reports->groupBy('desc_indicator')
            ->map(function ($indicatorReports) {
                $monthlyData = [];
                foreach (range(1, 12) as $month) {
                    $report = $indicatorReports->firstWhere('month', $month);
                    $monthlyData[$month] = $report;
                }

                return [
                    'indicator' => $indicatorReports->first()->desc_indicator,
                    'unit' => $indicatorReports->first()->masterReport?->unit ?? '',
                    'months' => $monthlyData,
                ];
            });

        // Create Excel
        $config = ExcelConfiguration::create()
            ->withHeaders(array_merge(
                ['#', 'Indikator', 'Satuan'],
                ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
            ))
            ->withColumnWidths(array_merge(
                [1 => 6, 2 => 40, 3 => 15],
                array_fill(4, 12, 15)
            ))
            ->withColumnFormats(array_fill(4, 12, '0.00'))
            ->withNumberColumns(range(4, 15))
            ->withRightAlignColumns(range(4, 15))
            ->withSheetTitle('Perhitungan Reports')
            ->withZebraStriping(true)
            ->withOrientation('landscape')
            ->withDocumentProperties([
                'subject' => 'Perhitungan Reports Index Export',
                'keywords' => 'perhitungan, reports, index, export, excel',
                'category' => 'Reports',
            ]);

        $this->spreadsheet = new Spreadsheet;
        $this->spreadsheet->removeSheetByIndex(0);

        ExcelStyleManager::setDocumentProperties($this->spreadsheet, $config);

        $sheet = $this->spreadsheet->createSheet();
        $sheet->setTitle($this->sanitizeSheetTitle('Perhitungan Reports'));

        // Add headers
        ExcelStyleManager::applyHeaderStyle($sheet, $config->headers, $config);

        // Add data rows
        $row = 2;
        $index = 1;
        foreach ($groupedReports as $data) {
            $rowData = [
                $index++,
                $data['indicator'],
                $data['unit'],
            ];

            // Add monthly nilai_archivement values
            foreach (range(1, 12) as $month) {
                $report = $data['months'][$month];
                $rowData[] = $report ? $report->nilai_archivement : '';
            }

            foreach ($rowData as $colIndex => $value) {
                $column = Coordinate::stringFromColumnIndex($colIndex + 1);
                $cell = $sheet->getCell($column . $row);
                $cell->setValue($value);

                ExcelStyleManager::applyCellFormatting(
                    $sheet,
                    $column,
                    $row,
                    $colIndex,
                    $value,
                    $config
                );
            }

            $sheet->getRowDimension($row)->setRowHeight(20);
            $row++;
        }

        // Apply sheet styles
        $lastRow = $row - 1;
        $lastColumn = count($config->headers);
        $lastColumnLetter = Coordinate::stringFromColumnIndex($lastColumn);

        // Set column widths
        foreach ($config->columnWidths as $col => $width) {
            $columnLetter = Coordinate::stringFromColumnIndex($col);
            $sheet->getColumnDimension($columnLetter)->setWidth($width)->setAutoSize(false);
        }

        if ($config->enableZebraStriping) {
            ExcelStyleManager::applyZebraStriping($sheet, $lastRow, $lastColumnLetter);
        }

        $sheet->getPageSetup()->setPrintArea("A1:{$lastColumnLetter}{$lastRow}");
        ExcelStyleManager::applySheetConfiguration($sheet, $config);

        // Save to file
        $writer = new Xlsx($this->spreadsheet);
        $writer->save($filePath);

        $this->spreadsheet->disconnectWorksheets();
        unset($this->spreadsheet);
    }

    protected function sanitizeSheetTitle(string $title): string
    {
        // Excel sheet title max length is 31 chars
        $title = preg_replace('/[\/\\\?\*\[\]:]+/', '-', $title);

        return Str::limit($title, 31, '');
    }

    private function getReportTypeId(?string $sqid): ?int
    {
        if (!$sqid) {
            return ReportTypes::first()?->id;
        }

        return ReportTypes::whereSqid($sqid)->first()?->id;
    }

    private function getAspectId(string $sqid): ?int
    {
        return Aspects::whereSqid($sqid)->first()?->id;
    }
}
