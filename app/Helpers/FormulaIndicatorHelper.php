<?php

namespace App\Helpers;

/**
 * Example formula string
 * GT 10 = 5;
 * GT 7 AND LTE 10 = 4;
 * GT 3 AND LTE 7 = 3;
 * GT 0 AND LTE 3 = 2;
 * LTE 0 = 1;
 */
class FormulaIndicatorHelper
{
    /**
     * Summary of evaluateFormula
     * @param string $formula
     * @param float $value
     * @return int
     */
    public static function evaluateFormula(string $formula, float $value): int
    {
        if ($formula == "" || !is_numeric($value)) {
            return 0;
        }
        // Split formula into lines
        $lines = explode(';', $formula);

        foreach ($lines as $line) {
            $line = trim($line);

            if (empty($line)) {
                continue;
            }

            // Split condition and result by '='
            $parts = explode('=', $line);

            if (count($parts) !== 2) {
                continue;
            }

            $condition = trim($parts[0]);
            $result = (int) trim($parts[1]);

            // Evaluate the condition
            if (self::evaluateCondition($condition, $value)) {
                return $result;
            }
        }

        return 0;
    }

    /**
     * Evaluate a single condition against a value
     * @param string $condition
     * @param float $value
     * @return bool
     */
    private static function evaluateCondition(string $condition, float $value): bool
    {
        // Split by AND operator
        $andParts = explode(' AND ', $condition);

        foreach ($andParts as $part) {
            $part = trim($part);

            if (str_starts_with($part, 'GT ')) {
                $threshold = (float) trim(substr($part, 3));
                if (!($value > $threshold)) {
                    return false;
                }
            } elseif (str_starts_with($part, 'GTE ')) {
                $threshold = (float) trim(substr($part, 4));
                if (!($value >= $threshold)) {
                    return false;
                }
            } elseif (str_starts_with($part, 'LT ')) {
                $threshold = (float) trim(substr($part, 3));
                if (!($value < $threshold)) {
                    return false;
                }
            } elseif (str_starts_with($part, 'LTE ')) {
                $threshold = (float) trim(substr($part, 4));
                if (!($value <= $threshold)) {
                    return false;
                }
            } elseif (str_starts_with($part, 'EQ ')) {
                $threshold = (float) trim(substr($part, 3));
                if (!($value == $threshold)) {
                    return false;
                }
            }
        }

        return true;
    }
}
