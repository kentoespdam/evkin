<?php

namespace App\Services\Excel;

use App\Data\ExcelConfiguration;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Helpers\CellHelper;
use Illuminate\Support\Facades\Log;

class ExcelStyleManager
{
    public static array $ALIGN_LEFT_CENTER_STYLE = [
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_LEFT,
            'vertical' => Alignment::VERTICAL_CENTER,
        ],
    ];

    public static array $ALIGN_RIGHT_CENTER_STYLE = [
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_RIGHT,
            'vertical' => Alignment::VERTICAL_CENTER,
        ],
    ];

    public static array $ALIGN_CENTER_CENTER_STYLE = [
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER,
        ],
    ];

    public static array $FILL_SOLID_GRAY_STYLE = [
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'color' => ['rgb' => 'D9E1F2'],
        ],
    ];

    public static $FONT_BOLD_12_STYLE = [
        'font' => [
            'bold' => true,
            'size' => 12,
        ],
    ];

    public static $FONT_BOLD_16_STYLE = [
        'font' => [
            'bold' => true,
            'size' => 16,
        ],
    ];

    public static array $ALL_BORDER_STYLE = [
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => '000000'],
            ],
        ],
    ];

    public static array $FORMAT_NUMBER_00_STYLE = [
        'number_format' => [
            'format_code' => '0.00',
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

    public static function addCell(Worksheet $sheet, string $cellCoordinate, $value = '', ?array $styleArray = []): void
    {
        $cell = $sheet->getCell($cellCoordinate);
        $cell->setValue($value);
        if (in_array('number_format', array_keys($styleArray))) {
            self::applyNumberFormat($sheet, $cellCoordinate, $styleArray['number_format']['format_code']);
        }
        if (!empty($styleArray) && $styleArray !== null) {
            $sheet->getStyle($cellCoordinate)->applyFromArray($styleArray);
        }
    }

    /**
     * Summary of applyHeaderStyle
     * @param Worksheet $sheet
     * @param array<CellHelper> $headers
     * @param ExcelConfiguration $config
     * @return void
     */
    public static function applyHeaderStyle(
        Worksheet $sheet,
        array $headers,
        ExcelConfiguration $config,
        int $currentRow
    ) {
        foreach ($headers as $index => $header) {
            $column = Coordinate::stringFromColumnIndex($index + 1);
            $styleFormat = array_merge(
                [
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'color' => ['rgb' => '366092'],
                    ],
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => 'FFFFFF'],
                        'size' => 11,
                    ],
                ],
                self::$ALIGN_CENTER_CENTER_STYLE,
                self::$ALL_BORDER_STYLE
            );

            self::addCell(
                $sheet,
                "{$column}{$currentRow}",
                $header->value,
                $styleFormat
            );
            if ($header->width != null) {
                $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($index + 1))
                    ->setWidth($header->width)
                    ->setAutoSize(false);
            }
        }

        $sheet->getRowDimension($currentRow)->setRowHeight($config->headerRowHeight);
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

}
