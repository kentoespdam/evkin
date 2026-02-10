<?php

namespace Tests\Unit\Services\Excel;

use App\Services\Excel\PositionTracker;
use App\Services\Excel\PositionTrackerBuilder;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\TestCase;

class PositionTrackerBuilderTest extends TestCase
{
    private PositionTracker $tracker;

    public function test_builds_position_tracker_with_default_values(): void
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder->build();

        $this->assertInstanceOf(PositionTracker::class, $tracker);
        $this->assertEquals(1, $tracker->nextRow());
        $this->assertEquals(1, $tracker->currentOrder());
    }

    public function test_sets_start_row(): void
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder->startRow(5)->build();

        $this->assertEquals(5, $tracker->nextRow());
    }

    public function test_sets_start_order(): void
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder->startOrder(10)->build();

        $this->assertEquals(10, $tracker->currentOrder());
    }

    public function test_sets_row_increment(): void
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder->startRow(1)
            ->rowIncrement(2)
            ->build();

        $this->assertEquals(1, $tracker->nextRow());
        $this->assertEquals(3, $tracker->nextRow());
    }

    public function test_sets_max_row(): void
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder->startRow(1)
            ->maxRow(10)
            ->build();

        $this->assertEquals(1, $tracker->nextRow());
    }

    public function test_fluent_chaining(): void
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder
            ->startRow(5)
            ->startOrder(3)
            ->rowIncrement(2)
            ->maxRow(100)
            ->build();

        $this->assertInstanceOf(PositionTracker::class, $tracker);
        $this->assertEquals(5, $tracker->nextRow());
        $this->assertEquals(3, $tracker->currentOrder());
    }

    public function test_multiple_builds_create_independent_instances(): void
    {
        $builder = new PositionTrackerBuilder;
        $builder->startRow(5);

        $tracker1 = $builder->build();
        $tracker2 = $builder->build();

        $this->assertNotSame($tracker1, $tracker2);
        $this->assertEquals(5, $tracker1->nextRow());
        $this->assertEquals(5, $tracker2->nextRow());
    }

    public function test_builder_can_be_reused_with_different_values(): void
    {
        $builder = new PositionTrackerBuilder;

        $tracker1 = $builder->startRow(1)->startOrder(1)->build();
        $tracker2 = $builder->startRow(10)->startOrder(5)->build();

        $this->assertEquals(1, $tracker1->nextRow());
        $this->assertEquals(1, $tracker1->currentOrder());

        $this->assertEquals(10, $tracker2->nextRow());
        $this->assertEquals(5, $tracker2->currentOrder());
    }

    public function test_returns_self_for_method_chaining(): void
    {
        $builder = new PositionTrackerBuilder;

        $result1 = $builder->startRow(5);
        $result2 = $builder->startOrder(3);
        $result3 = $builder->rowIncrement(2);
        $result4 = $builder->maxRow(100);

        $this->assertSame($builder, $result1);
        $this->assertSame($builder, $result2);
        $this->assertSame($builder, $result3);
        $this->assertSame($builder, $result4);
    }

    public function test_builds_with_only_start_row_set(): void
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder->startRow(15)->build();

        $this->assertEquals(15, $tracker->nextRow());
        $this->assertEquals(1, $tracker->currentOrder());
    }

    public function test_builds_with_only_start_order_set(): void
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder->startOrder(20)->build();

        $this->assertEquals(1, $tracker->nextRow());
        $this->assertEquals(20, $tracker->currentOrder());
    }

    public function test_builds_with_custom_increment(): void
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder
            ->startRow(10)
            ->rowIncrement(3)
            ->build();

        $this->assertEquals(10, $tracker->nextRow());
        $this->assertEquals(13, $tracker->nextRow());
        $this->assertEquals(16, $tracker->nextRow());
    }

    public function test_with_global_var()
    {
        $builder = new PositionTrackerBuilder;
        $tracker = $builder
            ->startRow(2)
            ->rowIncrement(2)
            ->build();

        $expect2 = $tracker->nextRow();
        $this->assertEquals(2, $expect2);
        Log::debug("Expecting row: {$expect2}");
        $expect4 = $tracker->nextRow();
        $this->assertEquals(4, $expect4);
        Log::debug("Expecting row: {$expect4}");
    }
}
