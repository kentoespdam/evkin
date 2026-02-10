<?php

namespace App\Services\Excel;

/**
 * Factory untuk membuat PositionTracker dengan berbagai preset
 */
enum PositionTrackerPreset: string
{
    case DEFAULT = 'default';
    case WITH_HEADER = 'with_header';
    case DATA_ONLY = 'data_only';
    case ZERO_BASED = 'zero_based';

    public function create(int $startRow = 1): PositionTracker
    {
        return match ($this) {
            self::DEFAULT => new PositionTracker(
                row: $startRow,
                order: 1,
                rowIncrement: 1
            ),
            self::WITH_HEADER => (new PositionTrackerBuilder())
                ->startRow($startRow + 1) // Lewati header
                ->build(),
            self::DATA_ONLY => new PositionTracker(
                row: $startRow,
                order: 0, // 0-based order untuk data array
                rowIncrement: 1
            ),
            self::ZERO_BASED => new PositionTracker(
                row: $startRow - 1, // Convert 1-based Excel ke 0-based internal
                order: 0,
                rowIncrement: 1
            ),
        };
    }
}