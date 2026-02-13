<?php

namespace App\Services\Excel;

/**
 * Trait untuk worksheet yang menggunakan PositionTracker
 */
trait TrackableWorksheet
{
    private ?PositionTracker $positionTracker = null;

    /**
     * Set position tracker
     */
    public function setPositionTracker(PositionTracker $tracker): void
    {
        $this->positionTracker = $tracker;
    }

    /**
     * Get position tracker, create if not exists
     */
    public function getPositionTracker(): PositionTracker
    {
        if (! $this->positionTracker) {
            $this->positionTracker = PositionTrackerPreset::DEFAULT->create();
        }

        return $this->positionTracker;
    }

    /**
     * Write row dengan auto tracking
     *
     * @return int Baris yang ditulis
     */
    public function writeRowWithTracking(array $data, array $columnMap = []): int
    {
        $tracker = $this->getPositionTracker();
        $row = $tracker->nextRow();

        foreach ($data as $column => $value) {
            $columnLetter = $columnMap[$column] ?? $column;
            $this->setCellValue("{$columnLetter}{$row}", $value);
        }

        return $row;
    }
}
