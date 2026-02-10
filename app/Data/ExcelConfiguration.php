<?php

namespace App\Data;

use App\Helpers\CellHelper;

class ExcelConfiguration
{
    /**
     * @param array<object, CellHelper> $headers
     * @param array<string, int> $columnWidths
     * @param array<string, string> $columnFormats
     * @param array<string, mixed> $styleRules
     * @param array<string, mixed> $conditionalFormattingRules
     * @param array<int, string> $wrappedColumns
     * @param array<int, string> $monospaceColumns
     * @param array<int, string> $numberColumns
     * @param array<int, string> $rightAlignColumns
     * @param array<string, string> $documentProperties
     */
    public function __construct(
        public array $headers = [],
        public array $columnWidths = [],
        public array $columnFormats = [],
        public array $styleRules = [],
        public string $sheetTitle = 'Export',
        public bool $enableZebraStriping = true,
        public bool $enableConditionalFormatting = false,
        public array $conditionalFormattingRules = [],
        public bool $freezeHeader = true,
        public string $orientation = 'landscape',
        public array $wrappedColumns = [],
        public array $monospaceColumns = [],
        public array $numberColumns = [],
        public array $rightAlignColumns = [],
        public int $maxRowsPerSheet = 100000,
        public int $chunkSize = 1000,
        public int $headerRowHeight = 25,
        public array $documentProperties = [],
    ) {
    }

    public static function create(): static
    {
        return new static(
            headers: [],
        );
    }

    public function withHeaders(array $headers): static
    {
        $this->headers = $headers;

        return $this;
    }

    public function withColumnWidths(array $columnWidths): static
    {
        $this->columnWidths = $columnWidths;

        return $this;
    }

    public function withColumnFormats(array $columnFormats): static
    {
        $this->columnFormats = $columnFormats;

        return $this;
    }

    public function withSheetTitle(string $title): static
    {
        $this->sheetTitle = $title;

        return $this;
    }

    public function withZebraStriping(bool $enabled = true): static
    {
        $this->enableZebraStriping = $enabled;

        return $this;
    }

    public function withConditionalFormatting(array $rules = []): static
    {
        $this->enableConditionalFormatting = true;
        $this->conditionalFormattingRules = $rules;

        return $this;
    }

    public function withWrappedColumns(array $columns): static
    {
        $this->wrappedColumns = $columns;

        return $this;
    }

    public function withMonospaceColumns(array $columns): static
    {
        $this->monospaceColumns = $columns;

        return $this;
    }

    public function withNumberColumns(array $columns): static
    {
        $this->numberColumns = $columns;

        return $this;
    }

    public function withRightAlignColumns(array $columns): static
    {
        $this->rightAlignColumns = $columns;

        return $this;
    }

    public function withOrientation(string $orientation): static
    {
        $this->orientation = $orientation;

        return $this;
    }

    public function withDocumentProperties(array $properties): static
    {
        $this->documentProperties = $properties;

        return $this;
    }

    public function withMaxRowsPerSheet(int $maxRows): static
    {
        $this->maxRowsPerSheet = $maxRows;

        return $this;
    }

    public function withChunkSize(int $chunkSize): static
    {
        $this->chunkSize = $chunkSize;

        return $this;
    }
}
