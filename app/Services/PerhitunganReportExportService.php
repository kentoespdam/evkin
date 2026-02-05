<?php

namespace App\Services;

use App\Models\Master\Aspects;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PerhitunganReportExportService
{
    protected const MAX_ROWS_PER_SHEET = 100000;
    protected const CHUNK_SIZE = 1000;
    protected const DEFAULT_COLUMN_WIDTHS = [
        1 => 4,    // A: #
        2 => 12,   // B: Periode
        3 => 25,   // C: Indikator
        4 => 25,   // D: Rumus
        5 => 20,   // E: Rumus Value
        6 => 12,   // F: Satuan
        7 => 15,   // G: Nilai
        8 => 15,   // H: Nilai Indikator
        9 => 15,   // I: Rumus Bobot
        10 => 12,  // J: Nilai Bobot
        11 => 20,  // K: Rumus Pencapaian
        12 => 20,  // L: Rumus Pencapaian Value
        13 => 15,  // M: Nilai Pencapaian
    ];

    protected array $headers = [
        '#',
        'Periode',
        'Indikator',
        'Rumus',
        'Rumus Value',
        'Satuan',
        'Nilai',
        'Nilai Indikator',
        'Rumus Bobot',
        'Nilai Bobot',
        'Rumus Pencapaian',
        'Rumus Pencapaian Value',
        'Nilai Pencapaian',
    ];

    protected Spreadsheet $spreadsheet;
    protected array $exportStats = [];
    protected array $columnWidths = []; // Track maximum width per column

    public function exportDetail(array $filters): StreamedResponse
    {
        $totalCount = $this->getReportsCount($filters);
        $this->exportStats['total_records'] = $totalCount;

        $this->spreadsheet = new Spreadsheet();
        $this->spreadsheet->removeSheetByIndex(0);

        if ($totalCount > self::MAX_ROWS_PER_SHEET) {
            return $this->exportLargeDataset($filters, $totalCount);
        }

        return $this->exportSingleSheet($filters, $totalCount);
    }

    private function exportSingleSheet(array $filters, int $totalCount): StreamedResponse
    {
        $sheet = $this->createSheet('Detail Perhitungan');

        $this->addHeaders($sheet);

        // Initialize column widths tracking with header widths
        $this->columnWidths = [];
        foreach ($this->headers as $index => $header) {
            $this->columnWidths[$index + 1] = strlen($header) * 1.2;
        }

        $row = 2;
        $processed = 0;

        $this->processReportsChunked($filters, function ($chunk) use ($sheet, &$row, &$processed, $totalCount) {
            foreach ($chunk as $index => $report) {
                $this->addReportRow($sheet, $row, $index + 1 + $processed, $report);
                $row++;
            }
            $processed += count($chunk);

            $this->updateExportProgress($processed, $totalCount);
        });

        $this->applySheetStyles($sheet, $row - 1);

        return $this->createStreamedResponse($filters);
    }

    private function exportLargeDataset(array $filters, int $totalCount): StreamedResponse
    {
        $sheetCount = ceil($totalCount / self::MAX_ROWS_PER_SHEET);
        $processedTotal = 0;

        for ($sheetIndex = 1; $sheetIndex <= $sheetCount; $sheetIndex++) {
            $sheetName = "Detail Perhitungan {$sheetIndex}";
            $sheet = $this->createSheet($sheetName);

            $this->addHeaders($sheet);

            // Initialize column widths tracking with header widths
            $this->columnWidths = [];
            foreach ($this->headers as $index => $header) {
                $this->columnWidths[$index + 1] = strlen($header) * 1.2;
            }

            $row = 2;
            $processedInSheet = 0;

            $this->processReportsChunked($filters, function ($chunk) use ($sheet, &$row, &$processedInSheet, &$processedTotal, $sheetIndex, $sheetCount) {
                foreach ($chunk as $index => $report) {
                    $this->addReportRow($sheet, $row, $index + 1 + $processedTotal, $report);
                    $row++;
                }
                $processedInSheet += count($chunk);
                $processedTotal += count($chunk);

                // Stop if sheet is full
                if ($row > self::MAX_ROWS_PER_SHEET + 1) {
                    return false; // Stop processing this sheet
                }
            });

            $this->applySheetStyles($sheet, $row - 1);
        }

        // Set first sheet as active
        $this->spreadsheet->setActiveSheetIndex(0);

        return $this->createStreamedResponse($filters);
    }

    private function createSheet(string $title): Worksheet
    {
        $sheet = $this->spreadsheet->createSheet();
        $sheet->setTitle($this->sanitizeSheetTitle($title));

        // Set document properties
        $this->spreadsheet->getProperties()
            ->setCreator(config('app.name'))
            ->setLastModifiedBy(config('app.name'))
            ->setTitle($title)
            ->setSubject('Perhitungan Reports Export')
            ->setDescription('Exported from ' . config('app.name'));

        return $sheet;
    }

    private function addHeaders(Worksheet $sheet): void
    {
        foreach ($this->headers as $index => $header) {
            $column = Coordinate::stringFromColumnIndex($index + 1);
            $cell = $sheet->getCell($column . '1');
            $cell->setValue($header);

            // Apply header styling
            $sheet->getStyle($column . '1')->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'color' => ['rgb' => '366092'],
                ],
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 11,
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
            ]);
        }

        // Set row height for header
        $sheet->getRowDimension(1)->setRowHeight(25);
    }

    private function addReportRow(Worksheet $sheet, int $row, int $index, $report): void
    {
        $data = [
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

        $maxLines = 1;

        foreach ($data as $colIndex => $value) {
            $column = Coordinate::stringFromColumnIndex($colIndex + 1);
            $cell = $sheet->getCell($column . $row);
            $cell->setValue(trim($value));

            // Apply number formatting for numeric columns
            $this->applyCellFormatting($sheet, $column, $row, $colIndex, $value);

            // Track max lines for wrapped text columns
            if (in_array($colIndex + 1, [3, 4])) { // Columns C, D (with wrap text)
                $lines = substr_count($value, '\n') + 1;
                $maxLines = max($maxLines, $lines);
            }

            // Track column width based on content
            $this->updateColumnWidth($colIndex + 1, $value);
        }

        // Set row height based on content
        $this->setRowHeightBasedOnContent($sheet, $row, $maxLines);

        // Add conditional formatting for high values (optional)
        if ($report->nilai_archivement > 80) {
            $sheet->getStyle('M' . $row)->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setRGB('C6EFCE');
        }
    }

    private function applyCellFormatting(Worksheet $sheet, string $column, int $row, int $colIndex, $value): void
    {
        $style = $sheet->getStyle($column . $row);

        // Number formatting
        if (in_array($colIndex + 1, [7, 8, 10, 13])) { // Columns G, H, J, M
            if (is_numeric($value)) {
                $format = ($colIndex + 1 == 10 || $colIndex + 1 == 13) && $value > 0
                    ? '0.00'
                    : '0.00';
                $style->getNumberFormat()->setFormatCode($format);
                $style->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            }
        }

        // Monospace font for formula columns
        if (in_array($colIndex + 1, [4, 5, 9, 12])) { // Columns D, E, I, L
            $style->getFont()->setName('Courier New')->setSize(9);
        }

        // Text wrapping for long text
        if (in_array($colIndex + 1, [3, 4])) { // Columns C, D
            $style->getAlignment()->setWrapText(true);
            $style->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
        }

        // Borders
        $style->getBorders()->getAllBorders()
            ->setBorderStyle(Border::BORDER_THIN)
            ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FFCCCCCC'));
    }

    private function setRowHeightBasedOnContent(Worksheet $sheet, int $row, int $maxLines): void
    {
        // Base height is 20 points
        $baseHeight = 20;

        // Add extra height for each additional line (approximately 15 points per line)
        $additionalHeight = ($maxLines - 1) * 15;

        $rowHeight = $baseHeight + $additionalHeight;

        // Set minimum height of 20 and maximum of 100
        $rowHeight = max(20, min($rowHeight, 100));

        $sheet->getRowDimension($row)->setRowHeight($rowHeight);
    }

    private function updateColumnWidth(int $colIndex, $value): void
    {
        // Convert value to string
        $text = (string) $value;

        // Calculate estimated width based on character count
        // Average character width is about 1-1.2 Excel width units
        $estimatedWidth = max(strlen($text) * 1.2, 8);

        // Store maximum width for this column
        if (!isset($this->columnWidths[$colIndex])) {
            $this->columnWidths[$colIndex] = $estimatedWidth;
        } else {
            $this->columnWidths[$colIndex] = max($this->columnWidths[$colIndex], $estimatedWidth);
        }
    }

    private function applySheetStyles(Worksheet $sheet, int $lastRow): void
    {
        $lastColumn = count($this->headers);
        $lastColumnLetter = Coordinate::stringFromColumnIndex($lastColumn);

        // Set column widths based on content or defaults
        for ($col = 1; $col <= $lastColumn; $col++) {
            $columnLetter = Coordinate::stringFromColumnIndex($col);
            $dimension = $sheet->getColumnDimension($columnLetter);

            // Use tracked width if available, otherwise use default or auto-size
            if (isset($this->columnWidths[$col])) {
                $dimension->setWidth($this->columnWidths[$col])->setAutoSize(false);
            } elseif (isset(self::DEFAULT_COLUMN_WIDTHS[$col])) {
                $dimension->setWidth(self::DEFAULT_COLUMN_WIDTHS[$col])->setAutoSize(false);
            } else {
                $dimension->setAutoSize(true);
            }
        }

        // Apply zebra striping
        $this->applyZebraStriping($sheet, $lastRow, $lastColumnLetter);

        // Freeze header row
        $sheet->freezePane('A2');

        // Set print area
        $sheet->getPageSetup()->setPrintArea("A1:{$lastColumnLetter}{$lastRow}");

        // Set page orientation and size
        $sheet->getPageSetup()
            ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);

        // Set margins
        $sheet->getPageMargins()
            ->setTop(0.75)
            ->setRight(0.25)
            ->setLeft(0.25)
            ->setBottom(0.75);

        // Repeat header row on each page
        $sheet->getPageSetup()->setRowsToRepeatAtTop([1, 1]);
    }

    private function applyZebraStriping(Worksheet $sheet, int $lastRow, string $lastColumnLetter): void
    {
        $zebraStyle = [
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['rgb' => 'F2F2F2'],
            ],
        ];

        // Apply zebra striping to even rows
        for ($row = 2; $row <= $lastRow; $row += 2) {
            $range = "A{$row}:{$lastColumnLetter}{$row}";
            $sheet->getStyle($range)->applyFromArray($zebraStyle);
        }
    }

    private function processReportsChunked(array $filters, callable $callback): void
    {
        $page = 1;
        $hasMore = true;

        while ($hasMore) {
            $reports = $this->getReportsChunk($filters, $page);

            if ($reports->isEmpty()) {
                $hasMore = false;
                break;
            }

            $continue = $callback($reports);

            // Clear memory for this chunk
            unset($reports);

            // Check if callback wants to stop
            if ($continue === false) {
                break;
            }

            $page++;
        }
    }

    private function getReportsChunk(array $filters, int $page): \Illuminate\Support\Collection
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

        return $query->orderBy('desc_indicator')
            ->skip(($page - 1) * self::CHUNK_SIZE)
            ->take(self::CHUNK_SIZE)
            ->get();
    }

    private function getReportsCount(array $filters): int
    {
        $cacheKey = 'export_count_' . md5(serialize($filters));

        return Cache::remember($cacheKey, 300, function () use ($filters) {
            $query = PerhitunganReports::where('year', $filters['year'])
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
                $query->where('desc_indicator', 'LIKE', "%{$filters['search']}%");
            }

            return $query->count();
        });
    }

    private function createStreamedResponse(array $filters): StreamedResponse
    {
        $fileName = $this->generateFileName($filters);

        // Log export statistics
        Log::info('Excel Export Completed', [
            'filters' => $filters,
            'stats' => $this->exportStats,
            'file_name' => $fileName,
        ]);

        return new StreamedResponse(
            function () {
                // Enable output buffering
                if (ob_get_level() == 0) {
                    ob_start();
                }

                $writer = new Xlsx($this->spreadsheet);

                // Set compression for better performance
                $writer->setPreCalculateFormulas(false);

                // Clear spreadsheet from memory after writing
                $writer->save('php://output');

                // Clean up
                $this->spreadsheet->disconnectWorksheets();
                unset($this->spreadsheet);

                if (ob_get_level() > 0) {
                    ob_end_flush();
                }
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
                'X-Accel-Buffering' => 'no', // Disable buffering for nginx
            ]
        );
    }

    private function generateFileName(array $filters): string
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

    private function sanitizeSheetTitle(string $title): string
    {
        // Excel sheet title restrictions: max 31 characters, no : \ / ? * [ ]
        $title = mb_substr($title, 0, 31);
        $title = str_replace([':', '\\', '/', '?', '*', '[', ']'], '', $title);

        return $title;
    }

    private function updateExportProgress(int $processed, int $total): void
    {
        // Optional: Cache export progress for monitoring
        if ($total > 5000) {
            $progress = round(($processed / $total) * 100);
            $cacheKey = 'export_progress_' . md5(serialize(request()->all()));
            Cache::put($cacheKey, $progress, 300);
        }
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

    // Additional method for batch export with background processing
    public function queueExport(array $filters, int $userId): string
    {
        $exportId = uniqid('export_', true);

        // Store export request in cache/database
        Cache::put("export.{$exportId}", [
            'filters' => $filters,
            'user_id' => $userId,
            'status' => 'pending',
            'created_at' => now(),
            'progress' => 0,
        ], 3600);

        // Queue the export job
        \App\Jobs\ProcessExportJob::dispatch($exportId, $filters, $userId);

        return $exportId;
    }

    // Method to generate export and store to disk
    public function generateAndStore(array $filters, string $filePath): void
    {
        $totalCount = $this->getReportsCount($filters);

        $this->spreadsheet = new Spreadsheet();
        $sheet = $this->spreadsheet->getActiveSheet();
        $sheet->setTitle('Detail Perhitungan');

        $this->addHeaders($sheet);

        $row = 2;
        $this->processReportsChunked($filters, function ($chunk) use ($sheet, &$row) {
            foreach ($chunk as $index => $report) {
                $this->addReportRow($sheet, $row, $index + 1, $report);
                $row++;
            }
            return true;
        });

        $this->applySheetStyles($sheet, $row - 1);

        // Save to file
        $writer = new Xlsx($this->spreadsheet);
        $writer->save($filePath);

        // Clean up
        $this->spreadsheet->disconnectWorksheets();
        unset($this->spreadsheet);
    }
}