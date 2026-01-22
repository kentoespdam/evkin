<?php

namespace Tests\Unit;

use App\Helpers\FormulaIndicatorHelper;
use PHPUnit\Framework\TestCase;

class FormulaIndicatorHelperTest extends TestCase
{
    public function test_evaluate_formula_with_greater_than_ten(): void
    {
        $formula = 'GT 10 = 5\nGT 7 AND LTE 10 = 4\nGT 3 AND LTE 7 = 3\nGT 0 AND LTE 3 = 2\nLTE 0 = 1';

        $result = FormulaIndicatorHelper::evaluateFormula($formula, 15.5);

        $this->assertEquals(5, $result);
    }

    public function test_evaluate_formula_with_value_between_seven_and_ten(): void
    {
        $formula = 'GT 10 = 5\nGT 7 AND LTE 10 = 4\nGT 3 AND LTE 7 = 3\nGT 0 AND LTE 3 = 2\nLTE 0 = 1';

        $result = FormulaIndicatorHelper::evaluateFormula($formula, 8.5);

        $this->assertEquals(4, $result);
    }

    public function test_evaluate_formula_with_value_exactly_ten(): void
    {
        $formula = 'GT 10 = 5\nGT 7 AND LTE 10 = 4\nGT 3 AND LTE 7 = 3\nGT 0 AND LTE 3 = 2\nLTE 0 = 1';

        $result = FormulaIndicatorHelper::evaluateFormula($formula, 10.0);

        $this->assertEquals(4, $result);
    }

    public function test_evaluate_formula_with_value_between_three_and_seven(): void
    {
        $formula = 'GT 10 = 5\nGT 7 AND LTE 10 = 4\nGT 3 AND LTE 7 = 3\nGT 0 AND LTE 3 = 2\nLTE 0 = 1';

        $result = FormulaIndicatorHelper::evaluateFormula($formula, 5.0);

        $this->assertEquals(3, $result);
    }

    public function test_evaluate_formula_with_value_between_zero_and_three(): void
    {
        $formula = 'GT 10 = 5\nGT 7 AND LTE 10 = 4\nGT 3 AND LTE 7 = 3\nGT 0 AND LTE 3 = 2\nLTE 0 = 1';

        $result = FormulaIndicatorHelper::evaluateFormula($formula, 2.0);

        $this->assertEquals(2, $result);
    }

    public function test_evaluate_formula_with_negative_value(): void
    {
        $formula = 'GT 10 = 5\nGT 7 AND LTE 10 = 4\nGT 3 AND LTE 7 = 3\nGT 0 AND LTE 3 = 2\nLTE 0 = 1';

        $result = FormulaIndicatorHelper::evaluateFormula($formula, -5.0);

        $this->assertEquals(1, $result);
    }

    public function test_evaluate_formula_with_zero_value(): void
    {
        $formula = 'GT 10 = 5\nGT 7 AND LTE 10 = 4\nGT 3 AND LTE 7 = 3\nGT 0 AND LTE 3 = 2\nLTE 0 = 1';

        $result = FormulaIndicatorHelper::evaluateFormula($formula, 0.0);

        $this->assertEquals(1, $result);
    }

    public function test_evaluate_formula_with_simple_condition(): void
    {
        $formula = 'GT 5 = 10\nLTE 5 = 5';

        $this->assertEquals(10, FormulaIndicatorHelper::evaluateFormula($formula, 7.0));
        $this->assertEquals(5, FormulaIndicatorHelper::evaluateFormula($formula, 3.0));
        $this->assertEquals(5, FormulaIndicatorHelper::evaluateFormula($formula, 5.0));
    }

    public function test_evaluate_formula_returns_zero_when_no_conditions_match(): void
    {
        $formula = 'GT 100 = 1';

        $result = FormulaIndicatorHelper::evaluateFormula($formula, 50.0);

        $this->assertEquals(0, $result);
    }

    public function test_evaluate_formula_with_empty_formula(): void
    {
        $formula = '';

        $result = FormulaIndicatorHelper::evaluateFormula($formula, 10.0);

        $this->assertEquals(0, $result);
    }

    public function test_evaluate_formula_with_gte_operator(): void
    {
        $formula = 'GTE 10 = 5\nLT 10 = 1';

        $this->assertEquals(5, FormulaIndicatorHelper::evaluateFormula($formula, 10.0));
        $this->assertEquals(5, FormulaIndicatorHelper::evaluateFormula($formula, 15.0));
        $this->assertEquals(1, FormulaIndicatorHelper::evaluateFormula($formula, 9.0));
    }

    public function test_evaluate_formula_with_lt_operator(): void
    {
        $formula = 'LT 5 = 10\nGTE 5 = 20';

        $this->assertEquals(10, FormulaIndicatorHelper::evaluateFormula($formula, 3.0));
        $this->assertEquals(20, FormulaIndicatorHelper::evaluateFormula($formula, 5.0));
        $this->assertEquals(20, FormulaIndicatorHelper::evaluateFormula($formula, 7.0));
    }

    public function test_evaluate_formula_with_eq_operator(): void
    {
        $formula = 'EQ 10 = 100\nGT 10 = 50\nLT 10 = 25';

        $this->assertEquals(100, FormulaIndicatorHelper::evaluateFormula($formula, 10.0));
        $this->assertEquals(50, FormulaIndicatorHelper::evaluateFormula($formula, 15.0));
        $this->assertEquals(25, FormulaIndicatorHelper::evaluateFormula($formula, 5.0));
    }

    public function test_evaluate_formula_with_complex_and_conditions(): void
    {
        $formula = 'GT 10 AND LT 20 = 1\nGT 5 AND LTE 10 = 2\nLTE 5 = 3';

        $this->assertEquals(1, FormulaIndicatorHelper::evaluateFormula($formula, 15.0));
        $this->assertEquals(2, FormulaIndicatorHelper::evaluateFormula($formula, 8.0));
        $this->assertEquals(2, FormulaIndicatorHelper::evaluateFormula($formula, 10.0));
        $this->assertEquals(3, FormulaIndicatorHelper::evaluateFormula($formula, 3.0));
    }
}
