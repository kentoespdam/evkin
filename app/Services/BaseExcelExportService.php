<?php

namespace App\Services;

use App\Data\ExcelConfiguration;
use App\Helpers\ExcelStyleManager;
use App\Traits\ExcelProgressTracker;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

abstract class BaseExcelExportService
{
    use ExcelProgressTracker;

    protected Spreadsheet $spreadsheet;

    protected ExcelConfiguration $config;

    protected array $columnWidths = [];

    abstract protected function getConfiguration(): ExcelConfiguration;

    abstract protected function getDataQuery(array $filters);

    abstract protected function processDataRow($item, int $index): array;

    abstract protected function generateFileName(array $filters): string;

    public function exportData(array $filters): StreamedResponse
    {
        $this->config = $this->getConfiguration();
        $this->initializeProgressTracking($filters);

        $totalCount = $this->getDataCount($filters);
        $this->setTotalRecords($totalCount);

        $this->spreadsheet = new Spreadsheet;
        $this->spreadsheet->removeSheetByIndex(0);

        ExcelStyleManager::setDocumentProperties($this->spreadsheet, $this->config);

        if ($totalCount > $this->config->maxRowsPerSheet) {
            return $this->exportMultipleSheets($filters, $totalCount);
        }

        return $this->exportSingleSheet($filters, $totalCount);
    }

    protected function exportSingleSheet(array $filters, int $totalCount): StreamedResponse
    {
        $sheet = $this->createSheet($this->config->sheetTitle);
        $this->addHeaders($sheet);
        $this->initializeColumnWidths();

        $row = 2;
        $processed = 0;

        $this->processDataChunked($filters, function ($chunk) use ($sheet, &$row, &$processed, $totalCount) {
            foreach ($chunk as $index => $item) {
                $data = $this->processDataRow($item, $index + 1 + $processed);
                $this->addDataRow($sheet, $row, $data);
                $row++;
            }
            $processed += count($chunk);
            $this->updateExportProgress($processed, $totalCount);
        });

        $this->applySheetStyles($sheet, $row - 1);
        $this->markExportCompleted();

        return $this->createStreamedResponse($filters);
    }

    protected function exportMultipleSheets(array $filters, int $totalCount): StreamedResponse
    {
        $sheetCount = ceil($totalCount / $this->config->maxRowsPerSheet);
        $this->setCurrentSheet(1, $sheetCount);

        $processedTotal = 0;

        for ($sheetIndex = 1; $sheetIndex <= $sheetCount; $sheetIndex++) {
            $this->setCurrentSheet($sheetIndex, $sheetCount);

            $sheetName = "{$this->config->sheetTitle} {$sheetIndex}";
            $sheet = $this->createSheet($sheetName);
            $this->addHeaders($sheet);
            $this->initializeColumnWidths();

            $row = 2;
            $processedInSheet = 0;

            $this->processDataChunked($filters, function ($chunk) use ($sheet, &$row, &$processedInSheet, &$processedTotal) {
                foreach ($chunk as $index => $item) {
                    $data = $this->processDataRow($item, $index + 1 + $processedTotal);
                    $this->addDataRow($sheet, $row, $data);
                    $row++;
                    $processedInSheet++;

                    if ($processedInSheet >= $this->config->maxRowsPerSheet) {
                        return false; // Stop processing this sheet
                    }
                }
                $processedTotal += count($chunk);
                $this->updateExportProgress($processedTotal);
            });

            $this->applySheetStyles($sheet, $row - 1);
        }

        $this->spreadsheet->setActiveSheetIndex(0);
        $this->markExportCompleted();

        return $this->createStreamedResponse($filters);
    }

    protected function createSheet(string $title): Worksheet
    {
        $sheet = $this->spreadsheet->createSheet();
        $sheet->setTitle($this->sanitizeSheetTitle($title));

        return $sheet;
    }

    protected function addHeaders(Worksheet $sheet): void
    {
        ExcelStyleManager::applyHeaderStyle($sheet, $this->config->headers, $this->config);
    }

    protected function initializeColumnWidths(): void
    {
        $this->columnWidths = [];
        foreach ($this->config->headers as $index => $header) {
            // Use more accurate width calculation for headers
            $baseHeaderWidth = mb_strlen($header) * 1.3;

            // Apply minimum widths based on header content (nowrap)
            $minWidth = match ($index + 1) {
                1 => 6,   // Index column
                2 => 15,  // Date/Periode columns
                3, 4 => 25, // Text/Formula columns (nowrap, wider)
                default => 12, // Other columns (nowrap)
            };

            $this->columnWidths[$index + 1] = max($baseHeaderWidth, $minWidth);
        }
    }

    protected function addDataRow(Worksheet $sheet, int $row, array $data): void
    {
        foreach ($data as $colIndex => $value) {
            $column = Coordinate::stringFromColumnIndex($colIndex + 1);
            $cell = $sheet->getCell($column.$row);
            $cell->setValue(trim($value));

            ExcelStyleManager::applyCellFormatting(
                $sheet,
                $column,
                $row,
                $colIndex,
                $value,
                $this->config
            );

            $this->updateColumnWidth($colIndex + 1, $value, $colIndex);
        }

        // Set standard row height for nowrap content
        $sheet->getRowDimension($row)->setRowHeight(20);

        // Apply conditional formatting
        ExcelStyleManager::applyConditionalFormatting($sheet, $row, $data, $this->config);
    }

    protected function updateColumnWidth(int $colIndex, $value, int $dataColIndex): void
    {
        $text = (string) $value;

        // Base width calculation
        $baseWidth = mb_strlen($text);

        // Adjust width based on column type and formatting
        $multiplier = 1.2; // Default multiplier

        // Monospace columns need more space
        if (in_array($colIndex, $this->config->monospaceColumns)) {
            $multiplier = 1.4;
        }

        // Number columns with right alignment
        if (in_array($colIndex, $this->config->numberColumns)) {
            $multiplier = 1.3;

            // Add extra space for formatted numbers
            if (is_numeric($value)) {
                $baseWidth = max($baseWidth, strlen(number_format((float) $value, 2)));
            }
        }

        $estimatedWidth = max($baseWidth * $multiplier, 8);

        // Apply reasonable max widths for nowrap content
        $maxWidth = match ($dataColIndex + 1) {
            1 => 8,   // Index column
            2 => 18,  // Periode/Date columns
            3, 4 => 60, // Text/Formula columns (nowrap, allow wider)
            default => 40, // Other columns (nowrap, allow wider)
        };

        $estimatedWidth = min($estimatedWidth, $maxWidth);

        if (! isset($this->columnWidths[$colIndex])) {
            $this->columnWidths[$colIndex] = $estimatedWidth;
        } else {
            $this->columnWidths[$colIndex] = max($this->columnWidths[$colIndex], $estimatedWidth);
        }
    }

    protected function applySheetStyles(Worksheet $sheet, int $lastRow): void
    {
        $lastColumn = count($this->config->headers);
        $lastColumnLetter = Coordinate::stringFromColumnIndex($lastColumn);

        // Set column widths
        for ($col = 1; $col <= $lastColumn; $col++) {
            $columnLetter = Coordinate::stringFromColumnIndex($col);
            $dimension = $sheet->getColumnDimension($columnLetter);

            if (isset($this->columnWidths[$col])) {
                $dimension->setWidth($this->columnWidths[$col])->setAutoSize(false);
            } elseif (isset($this->config->columnWidths[$col])) {
                $dimension->setWidth($this->config->columnWidths[$col])->setAutoSize(false);
            } else {
                $dimension->setAutoSize(true);
            }
        }

        // Apply zebra striping
        if ($this->config->enableZebraStriping) {
            ExcelStyleManager::applyZebraStriping($sheet, $lastRow, $lastColumnLetter);
        }

        // Set print area
        $sheet->getPageSetup()->setPrintArea("A1:{$lastColumnLetter}{$lastRow}");

        // Apply sheet configuration
        ExcelStyleManager::applySheetConfiguration($sheet, $this->config);
    }

    protected function processDataChunked(array $filters, callable $callback): void
    {
        $page = 1;
        $hasMore = true;

        while ($hasMore) {
            $data = $this->getDataChunk($filters, $page);

            if ($data->isEmpty()) {
                $hasMore = false;
                break;
            }

            $continue = $callback($data);

            // Clear memory for this chunk
            unset($data);

            if ($continue === false) {
                break;
            }

            $page++;
        }
    }

    protected function getDataChunk(array $filters, int $page): Collection
    {
        return $this->getDataQuery($filters)
            ->skip(($page - 1) * $this->config->chunkSize)
            ->take($this->config->chunkSize)
            ->get();
    }

    protected function getDataCount(array $filters): int
    {
        return $this->getDataQuery($filters)->count();
    }

    protected function createStreamedResponse(array $filters): StreamedResponse
    {
        $fileName = $this->generateFileName($filters);

        return new StreamedResponse(
            function () {
                if (ob_get_level() == 0) {
                    ob_start();
                }

                $writer = new Xlsx($this->spreadsheet);
                $writer->setPreCalculateFormulas(false);
                $writer->save('php://output');

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
                'X-Accel-Buffering' => 'no',
            ]
        );
    }

    protected function sanitizeSheetTitle(string $title): string
    {
        $title = mb_substr($title, 0, 31);
        $title = str_replace([':', '\\', '/', '?', '*', '[', ']'], '', $title);

        return $title;
    }

    // Additional utility methods for background processing
    public function generateAndStore(array $filters, string $filePath): void
    {
        $this->config = $this->getConfiguration();

        $this->spreadsheet = new Spreadsheet;
        $sheet = $this->spreadsheet->getActiveSheet();
        $sheet->setTitle($this->config->sheetTitle);

        ExcelStyleManager::setDocumentProperties($this->spreadsheet, $this->config);

        $this->addHeaders($sheet);
        $this->initializeColumnWidths();

        $row = 2;
        $this->processDataChunked($filters, function ($chunk) use ($sheet, &$row) {
            foreach ($chunk as $index => $item) {
                $data = $this->processDataRow($item, $index + 1);
                $this->addDataRow($sheet, $row, $data);
                $row++;
            }

            return true;
        });

        $this->applySheetStyles($sheet, $row - 1);

        $writer = new Xlsx($this->spreadsheet);
        $writer->save($filePath);

        $this->spreadsheet->disconnectWorksheets();
        unset($this->spreadsheet);
    }
}
