<?php

namespace App\Services\Excel;

/**
 * Builder untuk PositionTracker dengan fluent interface
 */
class PositionTrackerBuilder
{
    private int $startRow = 1;

    private int $startOrder = 1;

    private int $rowIncrement = 1;

    private ?int $maxRow = null;

    /**
     * Set baris awal
     *
     * @param  int  $row  Baris awal
     * @return $this
     */
    public function startRow(int $row): self
    {
        $this->startRow = $row;

        return $this;
    }

    /**
     * Set urutan awal
     *
     * @param  int  $order  Urutan awal
     * @return $this
     */
    public function startOrder(int $order): self
    {
        $this->startOrder = $order;

        return $this;
    }

    /**
     * Set increment baris
     *
     * @param  int  $increment  Increment baris
     * @return $this
     */
    public function rowIncrement(int $increment): self
    {
        $this->rowIncrement = $increment;

        return $this;
    }

    /**
     * Set batas maksimal baris
     *
     * @param  int  $maxRow  Batas maksimal baris
     * @return $this
     */
    public function maxRow(int $maxRow): self
    {
        $this->maxRow = $maxRow;

        return $this;
    }

    /**
     * Build PositionTracker
     */
    public function build(): PositionTracker
    {
        return new PositionTracker(
            row: $this->startRow,
            order: $this->startOrder,
            rowIncrement: $this->rowIncrement,
            maxRow: $this->maxRow
        );
    }
}
