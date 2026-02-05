<?php

namespace App\Helpers;

use App\Data\ExcelConfiguration;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExcelStyleManager
{
    public static function applyHeaderStyle(Worksheet $sheet, array $headers, ExcelConfiguration $config): void
    {
        foreach ($headers as $index => $header) {
            $column = Coordinate::stringFromColumnIndex($index + 1);
            $cell = $sheet->getCell($column.'1');
            $cell->setValue($header);

            $sheet->getStyle($column.'1')->applyFromArray([
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

        $sheet->getRowDimension(1)->setRowHeight($config->headerRowHeight);
    }

    public static function applyCellFormatting(
        Worksheet $sheet,
        string $column,
        int $row,
        int $colIndex,
        $value,
        ExcelConfiguration $config
    ): void {
        $style = $sheet->getStyle($column.$row);

        // Number formatting for numeric columns
        if (in_array($colIndex + 1, $config->numberColumns)) {
            if (is_numeric($value)) {
                $format = $config->columnFormats[$colIndex + 1] ?? '0.00';
                $style->getNumberFormat()->setFormatCode($format);
            }
        }

        // Right align specific columns
        if (in_array($colIndex + 1, $config->rightAlignColumns)) {
            $style->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }

        // Monospace font for specific columns
        if (in_array($colIndex + 1, $config->monospaceColumns)) {
            $style->getFont()->setName('Courier New')->setSize(9);
        }

        // Ensure all text is nowrap (disable text wrapping for all columns)
        $style->getAlignment()->setWrapText(false);

        // Set vertical alignment to center for better appearance
        $style->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        // Borders
        $style->getBorders()->getAllBorders()
            ->setBorderStyle(Border::BORDER_THIN)
            ->setColor(new Color('FFCCCCCC'));
    }

    public static function applyZebraStriping(Worksheet $sheet, int $lastRow, string $lastColumnLetter): void
    {
        $zebraStyle = [
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['rgb' => 'F2F2F2'],
            ],
        ];

        for ($row = 2; $row <= $lastRow; $row += 2) {
            $range = "A{$row}:{$lastColumnLetter}{$row}";
            $sheet->getStyle($range)->applyFromArray($zebraStyle);
        }
    }

    public static function applyConditionalFormatting(
        Worksheet $sheet,
        int $row,
        array $data,
        ExcelConfiguration $config
    ): void {
        if (! $config->enableConditionalFormatting) {
            return;
        }

        foreach ($config->conditionalFormattingRules as $rule) {
            $columnIndex = $rule['column'];
            $condition = $rule['condition'];
            $value = $rule['value'];
            $style = $rule['style'];

            if (! isset($data[$columnIndex - 1])) {
                continue;
            }

            $cellValue = $data[$columnIndex - 1];
            $shouldApply = false;

            switch ($condition) {
                case '>':
                    $shouldApply = is_numeric($cellValue) && $cellValue > $value;
                    break;
                case '<':
                    $shouldApply = is_numeric($cellValue) && $cellValue < $value;
                    break;
                case '=':
                    $shouldApply = $cellValue == $value;
                    break;
                case '>=':
                    $shouldApply = is_numeric($cellValue) && $cellValue >= $value;
                    break;
                case '<=':
                    $shouldApply = is_numeric($cellValue) && $cellValue <= $value;
                    break;
            }

            if ($shouldApply) {
                $column = Coordinate::stringFromColumnIndex($columnIndex);
                $sheet->getStyle($column.$row)->applyFromArray($style);
            }
        }
    }

    public static function applySheetConfiguration(Worksheet $sheet, ExcelConfiguration $config): void
    {
        $lastColumn = count($config->headers);
        $lastColumnLetter = Coordinate::stringFromColumnIndex($lastColumn);

        // Set column widths
        for ($col = 1; $col <= $lastColumn; $col++) {
            $columnLetter = Coordinate::stringFromColumnIndex($col);
            $dimension = $sheet->getColumnDimension($columnLetter);

            if (isset($config->columnWidths[$col])) {
                $dimension->setWidth($config->columnWidths[$col])->setAutoSize(false);
            } else {
                $dimension->setAutoSize(true);
            }
        }

        // Freeze header if enabled
        if ($config->freezeHeader) {
            $sheet->freezePane('A2');
        }

        // Set page orientation and size
        $orientationConstant = $config->orientation === 'landscape'
            ? \PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE
            : \PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_PORTRAIT;

        $sheet->getPageSetup()
            ->setOrientation($orientationConstant)
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

    public static function setDocumentProperties(\PhpOffice\PhpSpreadsheet\Spreadsheet $spreadsheet, ExcelConfiguration $config): void
    {
        $properties = $spreadsheet->getProperties();

        $defaultProperties = [
            'creator' => config('app.name'),
            'lastModifiedBy' => config('app.name'),
            'title' => $config->sheetTitle,
            'subject' => 'Export from '.config('app.name'),
            'description' => 'Generated on '.now()->format('Y-m-d H:i:s'),
        ];

        $allProperties = array_merge($defaultProperties, $config->documentProperties);

        foreach ($allProperties as $property => $value) {
            match ($property) {
                'creator' => $properties->setCreator($value),
                'lastModifiedBy' => $properties->setLastModifiedBy($value),
                'title' => $properties->setTitle($value),
                'subject' => $properties->setSubject($value),
                'description' => $properties->setDescription($value),
                'keywords' => $properties->setKeywords($value),
                'category' => $properties->setCategory($value),
                default => null,
            };
        }
    }

    public static function calculateRowHeight(array $data, array $wrappedColumns): int
    {
        $maxLines = 1;

        foreach ($data as $colIndex => $value) {
            if (in_array($colIndex + 1, $wrappedColumns)) {
                $lines = substr_count((string) $value, "\n") + 1;
                $maxLines = max($maxLines, $lines);
            }
        }

        // Base height is 20 points, add 15 points per additional line
        $baseHeight = 20;
        $additionalHeight = ($maxLines - 1) * 15;
        $rowHeight = $baseHeight + $additionalHeight;

        return max(20, min($rowHeight, 100));
    }
}
