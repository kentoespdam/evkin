<?php

namespace App\Helpers;

/**
 * Example formula string
 * LTE 30 = "TIDAK BAIK";
 * LTE 45 = "KURANG";
 * LTE 60 = "CUKUP";
 * LTE 75 = "BAIK";
 * GT 75 = "BAIK SEKALI";
 */
class FormulaPerformanceHelper
{
    public static function evaluateFormulaWithVariables(string $formula, ?float $value = null)
    {
        if ($formula == null || $value == null || $formula == '' || ! is_numeric($value)) {
            return null;
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
            $result = trim($parts[1]);

            // Evaluate the condition
            if (self::evaluateCondition($condition, $value)) {
                return str_replace('"', '', $result);
            }
        }

        return null;
    }

    /**
     * Evaluate a single condition against a value
     */
    private static function evaluateCondition(string $condition, float $value): bool
    {
        // Split by AND operator
        $andParts = explode(' AND ', $condition);

        foreach ($andParts as $part) {
            $part = trim($part);

            if (str_starts_with($part, 'GT ')) {
                $threshold = (float) trim(substr($part, 3));
                if (! ($value > $threshold)) {
                    return false;
                }
            } elseif (str_starts_with($part, 'GTE ')) {
                $threshold = (float) trim(substr($part, 4));
                if (! ($value >= $threshold)) {
                    return false;
                }
            } elseif (str_starts_with($part, 'LT ')) {
                $threshold = (float) trim(substr($part, 3));
                if (! ($value < $threshold)) {
                    return false;
                }
            } elseif (str_starts_with($part, 'LTE ')) {
                $threshold = (float) trim(substr($part, 4));
                if (! ($value <= $threshold)) {
                    return false;
                }
            } elseif (str_starts_with($part, 'EQ ')) {
                $threshold = (float) trim(substr($part, 3));
                if (! ($value == $threshold)) {
                    return false;
                }
            }
        }

        return true;
    }
}
