<?php

namespace Tests\Unit;

use App\Helpers\EvaluateRulesHelper;
use PHPUnit\Framework\TestCase;

class EvaluateRulesHelperTest extends TestCase
{
    public function test_returns_label_for_matching_value(): void
    {
        $formula = "1 = Tidak Memenuhi Syarat\n2 = Memenuhi Syarat Air Bersih\n3 = Memenuhi Syarat Air Minum";

        $result = EvaluateRulesHelper::evaluateRulesOptions($formula, 2.0);

        $this->assertSame('Memenuhi Syarat Air Bersih', $result);
    }

    public function test_returns_null_when_formula_is_missing(): void
    {
        $this->assertNull(EvaluateRulesHelper::evaluateRulesOptions(null, 1.0));
        $this->assertNull(EvaluateRulesHelper::evaluateRulesOptions('', 1.0));
    }

    public function test_returns_null_when_value_is_missing(): void
    {
        $formula = "1 = Ya\n2 = Tidak";

        $this->assertNull(EvaluateRulesHelper::evaluateRulesOptions($formula, null));
    }

    public function test_handles_multiple_equal_signs_in_label(): void
    {
        $formula = '1 = Memenuhi = Syarat';

        $result = EvaluateRulesHelper::evaluateRulesOptions($formula, 1.0);

        $this->assertSame('Memenuhi = Syarat', $result);
    }

    public function test_ignores_non_numeric_option_values(): void
    {
        $formula = "abc = Invalid\n2 = Valid";

        $result = EvaluateRulesHelper::evaluateRulesOptions($formula, 2.0);

        $this->assertSame('Valid', $result);
    }

    public function test_returns_null_when_no_match(): void
    {
        $formula = "1 = Ya\n2 = Tidak";

        $result = EvaluateRulesHelper::evaluateRulesOptions($formula, 3.0);

        $this->assertNull($result);
    }
}
