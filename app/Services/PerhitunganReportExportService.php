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
use Symfony\Component\HttpFoundation\StreamedResponse;

class PerhitunganReportExportService
{
    public function exportDetail(array $filters): StreamedResponse
    {
        $reports = $this->getReports($filters);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Detail Perhitungan');

        // Add headers
        $this->addHeaders($sheet);

        // Add data rows
        $this->addDataRows($sheet, $reports);

        // Style and format
        $this->styleSheet($sheet, count($reports));

        // Create response
        return $this->createResponse($spreadsheet);
    }

    private function getReports(array $filters): mixed
    {
        $reportTypeId = $this->getReportTypeId($filters['report_type_id'] ?? null);
        $aspectId = isset($filters['aspect_id']) && $filters['aspect_id'] ? $this->getAspectId($filters['aspect_id']) : null;

        return PerhitunganReports::with('masterReport')
            ->where('year', $filters['year'])
            ->where('month', $filters['month'])
            ->whereHas('masterReport', fn($q) => $q->where('report_type_id', $reportTypeId))
            ->when($aspectId, fn($q) => $q->whereHas('masterReport', fn($inner) => $inner->where('aspect_id', $aspectId)))
            ->when($filters['search'] ?? null, fn($q) => $q->where('desc_indicator', 'like', "%{$filters['search']}%"))
            ->orderBy('desc_indicator')
            ->get();
    }

    private function addHeaders(Worksheet $sheet): void
    {
        $headers = [
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

        foreach ($headers as $index => $header) {
            $sheet->setCellValue([($index + 1), 1], $header);
        }
    }

    private function addDataRows(Worksheet $sheet, mixed $reports): void
    {
        $row = 2;

        foreach ($reports as $index => $report) {
            $sheet->setCellValue([1, $row], $index + 1);
            $sheet->setCellValue([2, $row], "{$report->year}-{$report->month}");
            $sheet->setCellValue([3, $row], $report->desc_indicator);
            $sheet->setCellValue([4, $row], $report->formula);
            $sheet->setCellValue([5, $row], $report->formula_value);
            $sheet->setCellValue([6, $row], $report->masterReport?->unit);
            $sheet->setCellValue([7, $row], $report->nilai);
            $sheet->setCellValue([8, $row], $report->nilai_indicator);
            $sheet->setCellValue([9, $row], $report->formula_nilai_bobot);
            $sheet->setCellValue([10, $row], $report->nilai_bobot);
            $sheet->setCellValue([11, $row], $report->formula_archivement);
            $sheet->setCellValue([12, $row], $report->formula_archivement_value);
            $sheet->setCellValue([13, $row], $report->nilai_archivement);

            $row++;
        }
    }

    private function styleSheet(Worksheet $sheet, int $dataRowCount): void
    {
        $lastRow = $dataRowCount + 1;
        $lastColumn = 13;

        // Header styling
        $headerRange = "A1:{$this->getColumnLetter($lastColumn)}1";
        $this->styleHeader($sheet, $headerRange);

        // Data styling
        $this->styleData($sheet, $lastRow, $lastColumn);

        // Auto-adjust column widths
        $this->autoAdjustColumns($sheet);

        // Freeze header
        $sheet->freezePane('A2');
    }

    private function styleHeader(Worksheet $sheet, string $range): void
    {
        $headerStyle = [
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '366092'],
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ];

        $sheet->getStyle($range)->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
    }

    private function styleData(Worksheet $sheet, int $lastRow, int $lastColumn): void
    {
        $dataRange = "A2:{$this->getColumnLetter($lastColumn)}{$lastRow}";

        // Base styling for all data
        $dataStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'CCCCCC'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_TOP,
                'wrapText' => true,
            ],
        ];

        $sheet->getStyle($dataRange)->applyFromArray($dataStyle);

        // Number formatting for specific columns
        $numberColumns = [7, 8, 10, 13]; // Nilai, Nilai Indikator, Nilai Bobot, Nilai Pencapaian

        for ($row = 2; $row <= $lastRow; $row++) {
            // Right-align number columns
            foreach ($numberColumns as $col) {
                $cellCoordinate = $this->getColumnLetter($col) . $row;
                $sheet->getStyle($cellCoordinate)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // Format decimals based on column
                if ($col === 10 || $col === 13) {
                    $value = $sheet->getCell($cellCoordinate)->getValue();
                    if ($value > 0) {
                        $sheet->getStyle($cellCoordinate)->getNumberFormat()->setFormatCode('0.00');
                    } else {
                        $sheet->getStyle($cellCoordinate)->getNumberFormat()->setFormatCode('0');
                    }
                } else {
                    $sheet->getStyle($cellCoordinate)->getNumberFormat()->setFormatCode('0.00');
                }
            }

            // Monospace font for formula columns (4, 5, 9, 12)
            foreach ([4, 5, 9, 12] as $col) {
                $cellCoordinate = $this->getColumnLetter($col) . $row;
                $sheet->getStyle($cellCoordinate)->getFont()->setName('Courier New')->setSize(9);
            }
        }
    }

    private function autoAdjustColumns(Worksheet $sheet): void
    {
        $columnLetters = [];
        for ($i = 1; $i <= 13; $i++) {
            $columnLetters[] = $this->getColumnLetter($i);
        }

        foreach ($columnLetters as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Set minimum widths for readability
        $minWidths = [
            'A' => 4,
            'B' => 12,
            'C' => 20,
            'D' => 20,
            'E' => 20,
            'F' => 12,
            'G' => 12,
            'H' => 15,
            'I' => 15,
            'J' => 12,
            'K' => 15,
            'L' => 20,
            'M' => 15,
        ];

        foreach ($minWidths as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
    }

    private function createResponse(Spreadsheet $spreadsheet): StreamedResponse
    {
        $fileName = 'perhitungan-reports-detail-' . now()->format('Y-m-d-His') . '.xlsx';

        return new StreamedResponse(
            function () use ($spreadsheet) {
                $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]
        );
    }

    private function getReportTypeId(?string $sqid = null): ?int
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

    private function getColumnLetter(int $columnNumber): string
    {
        $letter = '';
        while ($columnNumber > 0) {
            $columnNumber--;
            $letter = chr(65 + ($columnNumber % 26)) . $letter;
            $columnNumber = intdiv($columnNumber, 26);
        }

        return $letter;
    }
}
