<?php

namespace App\Helpers;

class ExcelExportHelper
{
    public static function formatNumber($value, int $decimals = 2): string
    {
        if (!is_numeric($value)) {
            return $value;
        }

        $formatted = number_format($value, $decimals, ',', '.');

        // Remove unnecessary decimal places for whole numbers
        if ($decimals > 0 && fmod($value, 1) == 0) {
            $formatted = number_format($value, 0, ',', '.');
        }

        return $formatted;
    }

    public static function getColumnLetter(int $columnNumber): string
    {
        $letters = '';
        while ($columnNumber > 0) {
            $columnNumber--;
            $letters = chr(65 + ($columnNumber % 26)) . $letters;
            $columnNumber = (int) ($columnNumber / 26);
        }
        return $letters;
    }

    public static function generateCellRange(int $startRow, int $endRow, int $startCol, int $endCol): string
    {
        $startColLetter = self::getColumnLetter($startCol);
        $endColLetter = self::getColumnLetter($endCol);

        return "{$startColLetter}{$startRow}:{$endColLetter}{$endRow}";
    }

    public static function sanitizeExcelValue($value)
    {
        // Prevent Excel injection attacks
        if (is_string($value)) {
            $injectionChars = ['=', '+', '-', '@'];
            $firstChar = substr($value, 0, 1);

            if (in_array($firstChar, $injectionChars)) {
                $value = "'" . $value;
            }

            // Escape HTML entities
            $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');

            // Remove control characters
            $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
        }

        return $value;
    }
}