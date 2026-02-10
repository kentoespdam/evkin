<?php

namespace App\Services\Excel;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

/**
 * Class untuk melacak posisi baris dan urutan saat generate Excel dengan PhpSpreadsheet
 * 
 * @package App\Services\Excel
 */
class PositionTracker
{
    /**
     * @param int $startRow Baris awal (biasanya 1 untuk Excel)
     * @param int $startOrder Urutan awal (biasanya 1)
     * @param int $rowIncrement Increment baris (default 1)
     * @param int|null $maxRow Batas maksimal baris (optional)
     */

    public function __construct(
        private int $row,
        private int $order = 1,
        private int $rowIncrement = 1,
        private ?int $maxRow = null
    ) {
    }

    /**
     * Mendapatkan baris saat ini dan increment untuk baris berikutnya
     * 
     * @return int Baris saat ini sebelum increment
     */
    public function nextRow(): int
    {
        $currentRow = $this->row;
        $this->row += $this->rowIncrement;

        $this->validateRowLimit();

        return $currentRow;
    }

    /**
     * Mendapatkan urutan saat ini dan increment untuk urutan berikutnya
     * 
     * @return int Urutan saat ini sebelum increment
     */
    public function nextOrder(): int
    {
        $currentOrder = $this->order;
        $this->order++;
        return $currentOrder;
    }

    /**
     * Melompati beberapa baris
     * 
     * @param int $steps Jumlah baris yang dilompati (default 1)
     * @return self Instance baru dengan row yang sudah di-advance
     */
    public function advanceRows(int $steps = 1): self
    {
        $newRow = $this->row + $steps;

        $this->validateRowLimit();

        return new self(
            row: $newRow,
            order: $this->order,
            rowIncrement: $this->rowIncrement,
            maxRow: $this->maxRow
        );
    }

    /**
     * Menulis data ke worksheet dengan otomatis increment row
     * 
     * @param Worksheet $worksheet Worksheet target
     * @param array $data Data yang akan ditulis (array associative)
     * @param array $columnMap Mapping kolom ke huruf kolom Excel
     * @return self Instance baru dengan row yang sudah di-increment
     */
    public function writeRow(Worksheet $worksheet, array $data, array $columnMap = []): self
    {
        foreach ($data as $column => $value) {
            $columnLetter = $columnMap[$column] ?? $column;

            if (is_string($columnLetter) && !preg_match('/^[A-Z]+$/', $columnLetter)) {
                // Convert column name to Excel letter if needed
                $columnLetter = $this->columnNameToLetter($columnLetter);
            }

            $cell = "{$columnLetter}{$this->row}";
            $worksheet->setCellValue($cell, $value);
        }

        return $this->advanceRows();
    }

    /**
     * Menulis data koleksi Laravel ke worksheet
     * 
     * @param Worksheet $worksheet Worksheet target
     * @param Collection $collection Koleksi data
     * @param callable $callback Callback untuk memformat setiap item
     * @param array $columnMap Mapping kolom ke huruf kolom Excel
     * @return self Instance baru setelah menulis semua data
     */
    public function writeCollection(
        Worksheet $worksheet,
        Collection $collection,
        callable $callback,
        array $columnMap = []
    ): self {
        $currentTracker = $this;

        foreach ($collection as $item) {
            $data = $callback($item);
            $currentTracker = $currentTracker->writeRow($worksheet, $data, $columnMap);
        }

        return $currentTracker;
    }

    /**
     * Mendapatkan baris saat ini
     * 
     * @return int Baris saat ini
     */
    public function currentRow(): int
    {
        return $this->row;
    }

    /**
     * Mendapatkan urutan saat ini
     * 
     * @return int Urutan saat ini
     */
    public function currentOrder(): int
    {
        return $this->order;
    }

    /**
     * Membuat instance baru dengan reset order
     * 
     * @param int $newOrder Urutan baru (default 1)
     * @return self Instance baru dengan order yang direset
     */
    public function resetOrder(int $newOrder = 1): self
    {
        return new self(
            row: $this->row,
            order: $newOrder,
            rowIncrement: $this->rowIncrement,
            maxRow: $this->maxRow
        );
    }

    /**
     * Membuat instance baru untuk section berbeda dalam worksheet yang sama
     * 
     * @param int $gap Jarak antar section (default 2 baris)
     * @return self Instance baru untuk section berikutnya
     */
    public function newSection(int $gap = 2): self
    {
        return new self(
            row: $this->row + $gap,
            order: 1,
            rowIncrement: $this->rowIncrement,
            maxRow: $this->maxRow
        );
    }

    /**
     * Helper untuk konversi nama kolom ke huruf Excel
     * 
     * @param string $columnName Nama kolom (A, B, C, atau 1, 2, 3)
     * @return string Huruf kolom Excel
     */
    private function columnNameToLetter(string $columnName): string
    {
        if (is_numeric($columnName)) {
            // Convert 1-based column index to letter
            return \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex((int) $columnName);
        }

        return strtoupper($columnName);
    }

    /**
     * Magic method untuk clone object (immutable)
     */
    public function __clone()
    {
        // Immutable object, tidak perlu clone internal state
    }

    /**
     * Validasi batas maksimal baris
     * 
     * @throws \RuntimeException Jika melebihi batas maksimal
     */
    private function validateRowLimit(): void
    {
        if ($this->maxRow !== null && $this->row > $this->maxRow) {
            throw new \RuntimeException(
                "Baris melebihi batas maksimal: {$this->maxRow}"
            );
        }
    }
}