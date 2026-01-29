<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;

class FormulaHelper
{
    /**
     * Safely evaluate mathematical formula.
     */
    public static function evaluateFormula(string $formula): float
    {
        try {
            // Check if formula has alphabetic characters
            if (preg_match('/[a-zA-Z]/', $formula)) {
                Log::error('Formula contains invalid characters: '.$formula);

                return (float) 0.0;
            }

            $normalizedFormula = self::normalizeFormula($formula);

            self::validateFormulaSyntax($normalizedFormula);

            $result = self::safeEvaluate($normalizedFormula);

            if (! is_numeric($result) || is_infinite($result) || is_nan($result)) {
                return 0.0;
            }

            return (float) $result;
        } catch (\Throwable $e) {
            return 0.0;
        }
    }

    /**
     * Normalize formula for evaluation.
     */
    private static function normalizeFormula(string $formula): string
    {
        // Remove any potentially dangerous characters except math operators, numbers, and parentheses
        $formula = preg_replace('/[^0-9+\-*\/\/()., ]/', '', $formula);

        // Replace multiple spaces with single space
        $formula = preg_replace('/\s+/', ' ', $formula);

        // Trim whitespace
        $formula = trim($formula);

        // Ensure proper spacing around operators for safety
        $formula = str_replace(['/', '*', '+', '-'], [' / ', ' * ', ' + ', ' - '], $formula);
        $formula = preg_replace('/\s+/', ' ', $formula);

        return $formula;
    }

    /**
     * Validate formula syntax.
     */
    private static function validateFormulaSyntax(string $formula): void
    {
        // Check for empty formula
        if (empty($formula)) {
            throw new \InvalidArgumentException('Formula cannot be empty');
        }

        // Check for invalid operator sequences
        if (preg_match('/[+\-*\/]{2,}/', $formula)) {
            throw new \InvalidArgumentException('Invalid operator sequence in formula');
        }

        // Check for mismatched parentheses
        $openParentheses = substr_count($formula, '(');
        $closeParentheses = substr_count($formula, ')');
        if ($openParentheses !== $closeParentheses) {
            throw new \InvalidArgumentException('Mismatched parentheses in formula');
        }

        // Check for division by zero pattern
        if (preg_match('/\/\s*0(\.0+)?/', $formula)) {
            throw new \InvalidArgumentException('Potential division by zero in formula');
        }
    }

    /**
     * Safely evaluate the formula.
     */
    private static function safeEvaluate(string $formula): float
    {
        // Use a safer evaluation method
        $result = self::evaluateExpression($formula);

        return $result;
    }

    /**
     * Evaluate mathematical expression without eval().
     */
    private static function evaluateExpression(string $expression): float
    {
        // Remove all whitespace
        $expression = str_replace(' ', '', $expression);

        // Handle parentheses first
        while (($start = strrpos($expression, '(')) !== false) {
            $end = strpos($expression, ')', $start);
            if ($end === false) {
                throw new \InvalidArgumentException('Mismatched parentheses');
            }

            $subExpr = substr($expression, $start + 1, $end - $start - 1);
            $subResult = self::calculateBasicExpression($subExpr);
            $expression = substr_replace($expression, $subResult, $start, $end - $start + 1);
        }

        // Calculate the final expression
        return self::calculateBasicExpression($expression);
    }

    /**
     * Calculate basic expression without parentheses.
     */
    private static function calculateBasicExpression(string $expression): float
    {
        // Handle multiplication and division
        $expression = preg_replace_callback(
            '/(-?\d+\.?\d*)\s*([*\/])\s*(-?\d+\.?\d*)/',
            function ($matches) {
                $left = (float) $matches[1];
                $right = (float) $matches[3];

                if ($matches[2] === '*') {
                    return $left * $right;
                } else { // division
                    if ($right == 0) {
                        throw new \DivisionByZeroError('Division by zero');
                    }

                    return $left / $right;
                }
            },
            $expression
        );

        // Handle addition and subtraction
        $expression = preg_replace_callback(
            '/(-?\d+\.?\d*)\s*([+\-])\s*(-?\d+\.?\d*)/',
            function ($matches) {
                $left = (float) $matches[1];
                $right = (float) $matches[3];

                if ($matches[2] === '+') {
                    return $left + $right;
                } else { // subtraction
                    return $left - $right;
                }
            },
            $expression
        );

        return (float) $expression;
    }
}
