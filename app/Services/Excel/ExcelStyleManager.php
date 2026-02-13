<?php

namespace App\Services\Excel;

use App\Data\ExcelConfiguration;
use App\Helpers\CellHelper;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExcelStyleManager
{
    public const ALIGN_LEFT_CENTER_STYLE = [
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_LEFT,
            'vertical' => Alignment::VERTICAL_CENTER,
        ],
    ];

    public const ALIGN_RIGHT_CENTER_STYLE = [
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_RIGHT,
            'vertical' => Alignment::VERTICAL_CENTER,
        ],
    ];

    public const ALIGN_CENTER_CENTER_STYLE = [
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER,
        ],
    ];

    public const FILL_SOLID_GRAY_STYLE = [
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'color' => ['rgb' => 'D9E1F2'],
        ],
    ];

    public const FILL_SOLID_BLUE_GRAY_STYLE = [
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'color' => ['rgb' => '366092'],
        ],
    ];

    public const FILL_SOLID_LIGHT_YELLOW_STYLE = [
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'color' => ['rgb' => 'FFF2CC'],
        ],
    ];

    public const FONT_BOLD_11 = [
        'font' => [
            'bold' => true,
            'color' => ['rgb' => 'FFFFFF'],
            'size' => 11,
        ],
    ];

    public const FONT_BOLD_12_STYLE = [
        'font' => [
            'bold' => true,
            'size' => 12,
        ],
    ];

    public const FONT_BOLD_16_STYLE = [
        'font' => [
            'bold' => true,
            'size' => 16,
        ],
    ];

    public const ALL_BORDER_STYLE = [
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => '000000'],
            ],
        ],
    ];

    public const FORMAT_NUMBER_00_STYLE = [
        'numberFormat' => [
            'format_code' => "0.00",
        ],
    ];

    public static function mergeStyles(array ...$styles): array
    {
        $result = [];

        foreach ($styles as $style) {
            $result = self::mergeStyleArray($result, $style);
        }

        return $result;
    }

    private static function mergeStyleArray(array $array1, array $array2): array
    {
        $merged = $array1;

        foreach ($array2 as $key => $value) {
            if (is_array($value) && isset($merged[$key]) && is_array($merged[$key])) {
                $merged[$key] = self::mergeStyleArray($merged[$key], $value);
            } else {
                $merged[$key] = $value;
            }
        }

        return $merged;
    }

    public static function addCell(
        Worksheet $sheet,
        string $cellCoordinate,
        $value = '',
        ?array $styleArray = [],
        ?int $colSpan = 1,
        ?int $rowSpan = 1,
        ?bool $wrapText = false
    ): void {
        if ($colSpan > 1 || $rowSpan > 1) {
            self::addCellWithMerge(
                $sheet,
                $cellCoordinate,
                $value,
                $styleArray,
                $colSpan,
                $rowSpan,
                $wrapText
            );

            return;
        }

        $cell = $sheet->getCell($cellCoordinate);
        $row = $cell->getRow();
        $cell->setValue($value);

        if (!empty($styleArray) && $styleArray !== null) {
            $sheet->getStyle($cellCoordinate)->applyFromArray($styleArray);
            if (in_array('numberFormat', array_keys($styleArray))) {
                $sheet->getStyle($cellCoordinate)->getNumberFormat()->setFormatCode($styleArray['numberFormat']['format_code']);
                // self::applyNumberFormat($sheet, $cellCoordinate, $styleArray['number_format']['format_code']);
            }
        }

        if ($wrapText) {
            $sheet->getStyle($cellCoordinate)->getAlignment()->setWrapText(true);
            $sheet->getRowDimension($row)->setRowHeight(-1);
        }
    }

    private static function addCellWithMerge(
        Worksheet $sheet,
        string $cellCoordinate,
        $value = '',
        ?array $styleArray = [],
        ?int $colSpan = 1,
        ?int $rowSpan = 1,
        ?bool $wrapText = false
    ) {
        $currentRow = Coordinate::coordinateFromString($cellCoordinate)[1];
        $lastColumn = Coordinate::stringFromColumnIndex(
            Coordinate::columnIndexFromString(Coordinate::coordinateFromString($cellCoordinate)[0]) + $colSpan - 1
        );
        $lastRow = $currentRow + $rowSpan - 1;

        if ($colSpan > 1 || $rowSpan > 1) {
            $sheet->mergeCells("{$cellCoordinate}:{$lastColumn}{$lastRow}");
            $sheet->getStyle("{$cellCoordinate}:{$lastColumn}{$lastRow}")->applyFromArray($styleArray);
        } elseif ($colSpan > 1) {
            $sheet->mergeCells("{$cellCoordinate}:{$lastColumn}{$currentRow}");
            $sheet->getStyle("{$cellCoordinate}:{$lastColumn}{$currentRow}")->applyFromArray($styleArray);
        } elseif ($rowSpan > 1) {
            $sheet->mergeCells("{$cellCoordinate}:{$cellCoordinate[0]}{$lastRow}");
            $sheet->getStyle("{$cellCoordinate}:{$cellCoordinate[0]}{$lastRow}")->applyFromArray($styleArray);
        }
        $sheet->getCell($cellCoordinate)->setValue($value);

        if ($wrapText) {
            $sheet->getStyle("{$cellCoordinate}:{$lastColumn}{$lastRow}")->getAlignment()->setWrapText(true);
            for ($r = $currentRow; $r <= $lastRow; $r++) {
                $sheet->getRowDimension($r)->setRowHeight(-1);
            }
        }
    }

    /**
     * Summary of applyHeaderStyle
     *
     * @param  array<CellHelper>  $headers
     * @return void
     */
    public static function applyHeaderStyle(
        Worksheet $sheet,
        array $headers,
        ExcelConfiguration $config,
        int $currentRow,
        ?int $columnIndex = 1
    ) {
        foreach ($headers as $index => $header) {
            $column = Coordinate::stringFromColumnIndex($columnIndex);
            // Log::debug("Applying header for column {$column} at row {$currentRow}");
            $styleFormat = self::mergeStyles(
                self::FONT_BOLD_11,
                self::FILL_SOLID_BLUE_GRAY_STYLE,
                self::ALIGN_CENTER_CENTER_STYLE,
                self::ALL_BORDER_STYLE
            );
            self::addCell(
                $sheet,
                "{$column}{$currentRow}",
                $header->value,
                $styleFormat,
                $header->colspan,
                $header->rowspan,
                $header->wrapText
            );
            if ($header->width != null) {
                $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($columnIndex))
                    ->setWidth($header->width)
                    ->setAutoSize(false);
            }
            $columnIndex += $header->colspan;
        }
    }

    private static function applyNumberFormat(Worksheet $sheet, string $cellCoordinate, string $format): void
    {
        $style = $sheet->getStyle($cellCoordinate);
        $style->getNumberFormat()->setFormatCode($format);
    }

    public static function applyCellFormatting(
        Worksheet $sheet,
        string $column,
        int $row,
        int $colIndex,
        $value,
        ExcelConfiguration $config
    ): void {
        $style = $sheet->getStyle($column . $row);

        // Number formatting for numeric columns
        if (in_array($colIndex + 1, $config->numberColumns)) {
            if (is_numeric($value)) {
                $format = $config->columnFormats[$colIndex + 1] ?? '0.00';
                self::applyNumberFormat($sheet, $column . $row, $format);
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

    public static function applySheetConfiguration(Worksheet $sheet, ExcelConfiguration $config): void
    {
        $lastColumn = count($config->headers);
        $lastColumnLetter = Coordinate::stringFromColumnIndex($lastColumn);

        // Set column widths
        for ($col = 1; $col <= $lastColumn; $col++) {
            $columnLetter = Coordinate::stringFromColumnIndex($col);
            $dimension = $sheet->getColumnDimension($columnLetter);

            if (isset($config->columnWidths[$col])) {
                $dimension->setWidth($config->columnWidths[$col])
                    ->setAutoSize(false);
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
            ? PageSetup::ORIENTATION_LANDSCAPE
            : PageSetup::ORIENTATION_PORTRAIT;

        $sheet->getPageSetup()
            ->setOrientation($orientationConstant)
            ->setPaperSize(PageSetup::PAPERSIZE_A4);

        // Set margins
        $sheet->getPageMargins()
            ->setTop(0.75)
            ->setRight(0.25)
            ->setLeft(0.25)
            ->setBottom(0.75);

        // Repeat header row on each page
        $sheet->getPageSetup()->setRowsToRepeatAtTop([1, 1]);
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
        if (!$config->enableConditionalFormatting) {
            return;
        }

        foreach ($config->conditionalFormattingRules as $rule) {
            $columnIndex = $rule['column'];
            $condition = $rule['condition'];
            $value = $rule['value'];
            $style = $rule['style'];

            if (!isset($data[$columnIndex - 1])) {
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
                $sheet->getStyle($column . $row)->applyFromArray($style);
            }
        }
    }

    public static function setDocumentProperties(Spreadsheet $spreadsheet, ExcelConfiguration $config): void
    {
        $properties = $spreadsheet->getProperties();

        $defaultProperties = [
            'creator' => 'Developer Perumdam Tirta Satria',
            'lastModifiedBy' => 'Developer Perumdam Tirta Satria',
            'title' => $config->sheetTitle,
            'subject' => 'Export from ' . config('app.name'),
            'description' => 'Generated on ' . now()->format('Y-m-d H:i:s'),
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
}
