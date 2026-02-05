<?php

namespace App\Helpers;

use App\Data\ExcelConfiguration;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExcelExportHelper
{
    public static function formatNumber($value, int $decimals = 2): string
    {
        if (! is_numeric($value)) {
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
            $letters = chr(65 + ($columnNumber % 26)).$letters;
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
                $value = "'".$value;
            }

            // Escape HTML entities
            $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');

            // Remove control characters
            $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
        }

        return $value;
    }

    /**
     * Convert PHP date/time to Excel date format
     */
    public static function convertDateToExcel($date): float
    {
        if (is_string($date)) {
            $date = \DateTime::createFromFormat('Y-m-d H:i:s', $date)
                ?? \DateTime::createFromFormat('Y-m-d', $date);
        }

        if ($date instanceof \DateTime) {
            return Date::PHPToExcel($date);
        }

        return 0;
    }

    /**
     * Get Excel number format for different data types
     */
    public static function getNumberFormat(string $type, int $decimals = 2): string
    {
        return match ($type) {
            'currency' => '"Rp "#,##0.00_-',
            'percentage' => '0.00%',
            'date' => 'dd/mm/yyyy',
            'datetime' => 'dd/mm/yyyy hh:mm:ss',
            'number' => $decimals > 0 ? "0.{str_repeat('0', $decimals)}" : '0',
            'accounting' => '_("Rp"* #,##0.00_);_("Rp"* \(#,##0.00\);_("Rp"* "-"??_);_(@_)',
            default => NumberFormat::FORMAT_GENERAL,
        };
    }

    /**
     * Calculate optimal column width based on content
     */
    public static function calculateOptimalWidth(array $values, float $minWidth = 8, float $maxWidth = 50): float
    {
        $maxLength = 0;

        foreach ($values as $value) {
            $length = mb_strlen((string) $value);
            $maxLength = max($maxLength, $length);
        }

        // Convert character count to Excel width units (approximately)
        $width = $maxLength * 1.2;

        return max($minWidth, min($width, $maxWidth));
    }

    /**
     * Apply memory optimization settings to writer
     */
    public static function optimizeWriter(Xlsx $writer): void
    {
        $writer->setPreCalculateFormulas(false);
        $writer->setUseDiskCaching(true, sys_get_temp_dir());
    }

    /**
     * Create a simple table configuration for common use cases
     */
    public static function createTableConfiguration(
        array $headers,
        array $numberColumns = [],
        array $dateColumns = [],
        array $wrappedColumns = [],
        string $title = 'Export'
    ): ExcelConfiguration {
        $config = ExcelConfiguration::create()
            ->withHeaders($headers)
            ->withSheetTitle($title)
            ->withNumberColumns($numberColumns)
            ->withWrappedColumns($wrappedColumns);

        // Set up right alignment for number columns
        if (! empty($numberColumns)) {
            $config->withRightAlignColumns($numberColumns);
        }

        // Set up column formats for different data types
        $columnFormats = [];
        foreach ($numberColumns as $col) {
            $columnFormats[$col] = '0.00';
        }
        foreach ($dateColumns as $col) {
            $columnFormats[$col] = 'dd/mm/yyyy';
        }

        if (! empty($columnFormats)) {
            $config->withColumnFormats($columnFormats);
        }

        return $config;
    }

    /**
     * Convert array of objects to array of arrays for Excel export
     */
    public static function convertObjectsToArrays(array $objects, array $properties): array
    {
        $result = [];

        foreach ($objects as $object) {
            $row = [];
            foreach ($properties as $property) {
                if (is_object($object) && isset($object->{$property})) {
                    $row[] = $object->{$property};
                } elseif (is_array($object) && isset($object[$property])) {
                    $row[] = $object[$property];
                } else {
                    $row[] = '';
                }
            }
            $result[] = $row;
        }

        return $result;
    }

    /**
     * Generate a unique filename for exports
     */
    public static function generateUniqueFileName(
        string $baseName,
        array $filters = [],
        string $extension = 'xlsx'
    ): string {
        $timestamp = now()->format('Y-m-d-His');
        $fileName = "{$baseName}-{$timestamp}";

        // Add filter information to filename if provided
        if (! empty($filters['year'])) {
            $fileName .= "-{$filters['year']}";
        }
        if (! empty($filters['month'])) {
            $fileName .= '-'.str_pad($filters['month'], 2, '0', STR_PAD_LEFT);
        }

        return "{$fileName}.{$extension}";
    }

    /**
     * Validate Excel export request parameters
     */
    public static function validateExportRequest(array $filters, array $requiredFields = []): array
    {
        $errors = [];

        foreach ($requiredFields as $field) {
            if (empty($filters[$field])) {
                $errors[] = "Field {$field} is required";
            }
        }

        // Validate year if provided
        if (isset($filters['year'])) {
            $year = (int) $filters['year'];
            if ($year < 2000 || $year > (int) date('Y') + 1) {
                $errors[] = 'Year must be between 2000 and next year';
            }
        }

        // Validate month if provided
        if (isset($filters['month'])) {
            $month = (int) $filters['month'];
            if ($month < 1 || $month > 12) {
                $errors[] = 'Month must be between 1 and 12';
            }
        }

        return $errors;
    }

    /**
     * Get memory-safe chunk size based on available memory
     */
    public static function getOptimalChunkSize(int $columnCount = 10, int $defaultChunk = 1000): int
    {
        $memoryLimit = ini_get('memory_limit');

        if ($memoryLimit === '-1') {
            return $defaultChunk;
        }

        // Convert memory limit to bytes
        $bytes = self::convertToBytes($memoryLimit);
        $availableMemory = $bytes * 0.7; // Use 70% of available memory

        // Estimate memory per row (rough calculation)
        $estimatedBytesPerRow = $columnCount * 100; // ~100 bytes per cell

        $optimalChunk = (int) ($availableMemory / $estimatedBytesPerRow / 10); // Divide by 10 for safety

        return max(100, min($optimalChunk, 5000)); // Between 100 and 5000
    }

    private static function convertToBytes(string $value): int
    {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $number = (int) $value;

        return match ($last) {
            'g' => $number * 1024 * 1024 * 1024,
            'm' => $number * 1024 * 1024,
            'k' => $number * 1024,
            default => $number,
        };
    }
}
