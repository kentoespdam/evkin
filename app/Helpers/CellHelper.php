<?php

namespace App\Helpers;

class CellHelper
{
    public string|int|float|bool $value;

    public int $colspan;

    public int $rowspan;

    public int $width;

    public string $alignment;

    public string $format;

    public bool $wrapText;

    public function __construct(
        string|int|float|bool $value,
        int $colspan = 1,
        int $rowspan = 1,
        int $width = 0,
        string $alignment = 'left',
        string $format = '',
        bool $wrapText = false
    ) {
        $this->value = $value;
        $this->colspan = $colspan;
        $this->rowspan = $rowspan;
        $this->width = $width;
        $this->alignment = $alignment;
        $this->format = $format;
        $this->wrapText = $wrapText;
    }
}
