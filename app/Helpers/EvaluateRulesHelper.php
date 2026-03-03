<?php

namespace App\Helpers;

class EvaluateRulesHelper
{
    /**
     * Evaluate a rules options formula and return the matching label.
     */
    public static function evaluateRulesOptions(?string $formula, ?int $value = null): ?string
    {
        if ($formula === null || $formula === '' || $value === null) {
            return null;
        }

        $lines = preg_split("/\r\n|\n|\r/", $formula) ?: [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            $parts = explode('=', $line, 2);
            $optionValue = trim($parts[0] ?? '');
            $optionLabel = trim($parts[1] ?? '');

            if ($optionValue === '' || ! is_numeric($optionValue)) {
                continue;
            }

            if ((int) $optionValue === (int) $value) {
                return $optionLabel;
            }
        }

        return null;
    }
}
