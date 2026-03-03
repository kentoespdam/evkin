<?php

namespace App\Services\PerhitunganReport\Kepmendagri;

use App\Data\ExcelConfiguration;
use App\Helpers\CellHelper;
use App\Helpers\DateHelper;
use App\Helpers\EvaluateRulesHelper;
use App\Models\Master\MasterReports;
use App\Services\Excel\ExcelStyleManager;
use App\Services\Excel\PositionTracker;
use App\Services\Excel\PositionTrackerBuilder;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Builds the Perhitungan Kepmendagri Excel report from organised data.
 */
class PerhitunganReportExcelBuilder
{
    private const TITLE_ROW_HEIGHT = 2;

    private const MONTH_COUNT = 12;

    private const BASIC_INFO_COLUMNS = 5; // A to E

    private const MONTH_DATA_START_COL = 6; // F

    private const ARCHIVEMENT_COL = 30; // AD

    private const ARCHIVEMENT_INDICATOR_COL = 31; // AE

    private const TOTAL_COLUMNS = 33; // up to column AG (for merging)

    private Spreadsheet $spreadsheet;

    private PositionTracker $positionTracker;

    private ExcelConfiguration $excelConfig;

    private array $headerCells = [];

    private int $year;

    private string $reportTypeName;

    private int $lastInputMonth;

    public function __construct(int $year, string $reportTypeName, int $lastInputMonth)
    {
        $this->year = $year;
        $this->reportTypeName = $reportTypeName;
        $this->lastInputMonth = $lastInputMonth;
        $this->positionTracker = (new PositionTrackerBuilder)->startRow(1)->build();
        $this->generateHeaders();
        $this->createExcelConfiguration();
    }

    /**
     * Build the spreadsheet with the provided data.
     */
    public function build(array $data): Spreadsheet
    {
        $this->initializeSpreadsheet();
        $this->addTitleRow();
        $this->addDataRows($data);
        $this->adjustColumnWidths();

        return $this->spreadsheet;
    }

    /**
     * Initialise the spreadsheet and set document properties.
     */
    private function initializeSpreadsheet(): void
    {
        $this->spreadsheet = new Spreadsheet;
        ExcelStyleManager::setDocumentProperties($this->spreadsheet, $this->excelConfig);
        $sheet = $this->spreadsheet->getActiveSheet();
        $sheet->setTitle($this->excelConfig->sheetTitle);
    }

    /**
     * Add the title rows.
     */
    private function addTitleRow(): void
    {
        $sheet = $this->spreadsheet->getActiveSheet();
        $titles = [
            sprintf('PROYEKSI PENILAIAN KINERJA PERUMDAM TIRTA SATRIA TAHUN %d', $this->year),
            'BERDASARKAN FORMULASI KEPMENDAGRI NO. 47 TAHUN 1999',
        ];

        foreach ($titles as $line) {
            $currentRow = $this->positionTracker->nextRow();
            ExcelStyleManager::addCell(
                $sheet,
                'A'.$currentRow,
                $line,
                ExcelStyleManager::mergeStyles(
                    ExcelStyleManager::FONT_BOLD_16_STYLE,
                    ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE
                )
            );
            $lastColumn = $this->getColumnLetter(self::TOTAL_COLUMNS);
            $sheet->mergeCells("A{$currentRow}:{$lastColumn}{$currentRow}");
        }

        $this->positionTracker = $this->positionTracker->advanceRows(self::TITLE_ROW_HEIGHT);
    }

    /**
     * Add all data rows and sections.
     */
    private function addDataRows(array $data): void
    {
        $this->generateReportTypeSections($data);
    }

    /**
     * Adjust column widths (disable auto-size for A-E as per original).
     */
    private function adjustColumnWidths(): void
    {
        foreach (range('A', 'E') as $col) {
            $this->spreadsheet->getActiveSheet()
                ->getColumnDimension($col)
                ->setAutoSize(false);
        }
    }

    /**
     * Generate all sections per aspect.
     */
    private function generateReportTypeSections(array $data): void
    {
        $sheet = $this->spreadsheet->getActiveSheet();

        foreach ($data['aspects'] as $aspect) {
            $aspectId = $aspect['id'];
            $dataRow = $data['masterReports'][$aspectId] ?? collect();

            $this->addTableHeader($sheet);
            $this->addAspectRow($sheet, $aspect);
            $this->addDataRowsForAspect(
                $sheet,
                $dataRow,
                $data['reports'][$aspectId] ?? collect(),
                $data['groupedArchivement'][$aspectId] ?? collect()
            );
            $this->addTotalRowForAspect(
                $sheet,
                $data['totalNilaiByAspect'][$aspectId] ?? collect(),
                $data['totalArchivementByAspect'][$aspectId] ?? null
            );
            $this->addTotalKinerjaRowForAspect(
                $sheet,
                $aspect['name'],
                $data['totalNilaiKinerjaByAspect'][$aspectId] ?? collect(),
                $data['totalNilaiArchivementByAspect'][$aspectId] ?? null
            );

            $this->positionTracker = $this->positionTracker->advanceRows(1);
        }

        $this->addNilaiPerformaRow($sheet, $data['totalNilaiPerformanceByYearMonth'] ?? collect(), 'total');
        $this->addNilaiPerformaRow($sheet, $data['totalNilaiPerformanceByYearMonth'] ?? collect(), 'nilaiPerformance');
    }

    /**
     * Add the main table header (three rows).
     */
    private function addTableHeader(Worksheet $sheet): void
    {
        ExcelStyleManager::applyHeaderStyle(
            $sheet,
            $this->headerCells[0],
            $this->excelConfig,
            $this->positionTracker->nextRow()
        );

        $column = Coordinate::stringFromColumnIndex(self::ARCHIVEMENT_COL);
        $coordinate = "{$column}{$this->positionTracker->nextRow()}";
        ExcelStyleManager::addCell(
            $sheet,
            $coordinate,
            $this->headerCells[1][0]->value,
            ExcelStyleManager::mergeStyles(
                ExcelStyleManager::FONT_BOLD_11,
                ExcelStyleManager::FILL_SOLID_BLUE_GRAY_STYLE,
                ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE,
                ExcelStyleManager::ALL_BORDER_STYLE
            ),
            2
        );

        ExcelStyleManager::applyHeaderStyle(
            $sheet,
            $this->headerCells[2],
            $this->excelConfig,
            $this->positionTracker->nextRow(),
            6
        );
    }

    /**
     * Add a row for an aspect (colored, merged).
     *
     * @param  \App\Models\Master\Aspects  $aspect
     */
    private function addAspectRow(Worksheet $sheet, $aspect): void
    {
        $currentRow = $this->positionTracker->nextRow();
        $styles = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE,
        );

        ExcelStyleManager::addCell(
            $sheet,
            'A'.$currentRow,
            $aspect->name,
            $styles,
            colSpan: self::TOTAL_COLUMNS
        );
    }

    /**
     * Add all data rows for a given aspect.
     */
    private function addDataRowsForAspect(
        Worksheet $sheet,
        Collection $dataRows,
        Collection $groupedReports,
        Collection $groupedArchivement
    ): void {
        foreach ($dataRows as $masterReport) {
            $masterReportId = $masterReport->id;
            $this->addReportRows(
                $sheet,
                $masterReport,
                $groupedReports[$masterReportId] ?? collect(),
                collect($groupedArchivement[$masterReportId]) ?? collect()
            );
        }
    }

    /**
     * Add a single report row (basic info + monthly data + achievement).
     *
     * @param  \App\Models\Master\MasterReports  $masterReport
     */
    private function addReportRows(
        Worksheet $sheet,
        $masterReport,
        Collection $reports,
        Collection $archivements
    ): void {
        $currentRow = $this->positionTracker->nextRow();

        $this->addBasicInfoCells($sheet, $currentRow, $masterReport);
        $this->addMonthlyDataCells($sheet, $currentRow, $masterReport, $reports);
        $this->addArchivementCells($sheet, $currentRow, $archivements);
    }

    /**
     * Add basic info columns (A–E).
     *
     * @param  \App\Models\Master\MasterReports  $masterReport
     */
    private function addBasicInfoCells(Worksheet $sheet, int $row, $masterReport): void
    {
        $bobot = (float) $masterReport->weight;
        $cells = [
            'A' => trim($masterReport->urut),
            'B' => trim($masterReport->desc_indicator),
            'C' => trim($masterReport->desc_formula),
            'D' => trim($masterReport->unit),
            'E' => $bobot > 0 ? number_format($bobot, 2) : '-',
        ];

        $style = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE,
            ExcelStyleManager::ALL_BORDER_STYLE
        );

        foreach ($cells as $column => $value) {
            ExcelStyleManager::addCell(
                $sheet,
                $column.$row,
                (string) $value,
                $style
            );
        }
    }

    /**
     * Add monthly data columns (two per month) for the current year and last December.
     */
    private function addMonthlyDataCells(Worksheet $sheet, int $row, MasterReports $masterReport, Collection $reports): void
    {
        $columnIndex = self::MONTH_DATA_START_COL;

        // Months of current year
        foreach (range(1, self::MONTH_COUNT) as $month) {
            $key = sprintf('%d-%d', $this->year, $month);
            $report = $reports[$key] ?? null;
            if ($masterReport->with_rules) {
                $this->addDetailRuleCellsForMonth($sheet, $row, $columnIndex, $report, $masterReport->rules);
            } else {
                $this->addDetailCellsForMonth($sheet, $row, $columnIndex, $report);
            }
            $columnIndex += 2;
        }

        $columnIndex += 2; // skip two columns? (original code had extra +2 after loop, then another +2 before last year)

        // December of previous year
        $reportDecemberLastYear = $reports[sprintf('%d-%d', $this->year - 1, 12)] ?? null;
        $this->addDetailCellsForMonth($sheet, $row, $columnIndex, $reportDecemberLastYear);
    }

    /**
     * Add two cells for a single month (Nilai and Nilai Indikator).
     *
     * @param  \App\Models\Transaksi\PerhitunganReports|null  $report
     */
    private function addDetailCellsForMonth(Worksheet $sheet, int $row, int $columnIndex, $report): void
    {
        $nilai = $report->nilai ?? null;
        $nilaiIndicator = $report->nilai_indicator ?? null;

        $styleFillPink = [];
        $styleTextRed = [];
        if (is_numeric($nilaiIndicator) && $nilaiIndicator <= 2) {
            $styleFillPink = ExcelStyleManager::FILL_SOLID_LIGHT_PINK_STYLE;
            if ($nilaiIndicator <= 1) {
                $styleTextRed = ExcelStyleManager::FONT_COLOR_RED_STYLE;
            }
        }

        $baseSytle = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE,
            ExcelStyleManager::ALL_BORDER_STYLE
        );

        $indicatorStyle = ExcelStyleManager::mergeStyles(
            $baseSytle,
            $styleFillPink,
            $styleTextRed
        );

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex).$row,
            is_numeric($nilai) ? number_format($nilai, 2) : '-',
            $baseSytle
        );

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex + 1).$row,
            is_numeric($nilaiIndicator) ? number_format($nilaiIndicator, 2) : '-',
            $indicatorStyle
        );
    }

    private function addDetailRuleCellsForMonth(Worksheet $sheet, int $row, int $columnIndex, $report, ?string $rules): void
    {
        $nilaiPencapaian = EvaluateRulesHelper::evaluateRulesOptions($rules, $report->nilai ?? null);
        $nilaiIndicator = $report->nilai_indicator ?? null;

        $styleFillPink = [];
        $styleTextRed = [];
        if (is_numeric($nilaiIndicator) && $nilaiIndicator <= 2) {
            $styleFillPink = ExcelStyleManager::FILL_SOLID_LIGHT_PINK_STYLE;
            if ($nilaiIndicator <= 1) {
                $styleTextRed = ExcelStyleManager::FONT_COLOR_RED_STYLE;
            }
        }

        $baseSytle = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE,
            ExcelStyleManager::ALL_BORDER_STYLE
        );

        $indicatorStyle = ExcelStyleManager::mergeStyles(
            $baseSytle,
            $styleFillPink,
            $styleTextRed
        );

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex).$row,
            $nilaiPencapaian,
            $baseSytle
        );

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex + 1).$row,
            is_numeric($nilaiIndicator) ? number_format($nilaiIndicator, 2) : '-',
            $indicatorStyle
        );
    }

    /**
     * Add achievement cells (columns AD and AE).
     */
    private function addArchivementCells(Worksheet $sheet, int $row, Collection $archivement): void
    {
        $nilaiArchivement = $archivement['nilai_archivement'] ?? null;
        $nilaiArchivementIndicator = $archivement['nilai_archivement_indicator'] ?? null;

        $styleFillPink = [];
        $styleTextRed = [];
        if (is_numeric($nilaiArchivementIndicator) && $nilaiArchivementIndicator <= 2) {
            $styleFillPink = ExcelStyleManager::FILL_SOLID_LIGHT_PINK_STYLE;
            if ($nilaiArchivementIndicator <= 1) {
                $styleTextRed = ExcelStyleManager::FONT_COLOR_RED_STYLE;
            }
        }

        $style = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALIGN_RIGHT_CENTER_STYLE,
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE,
        );

        $indicatorStyle = ExcelStyleManager::mergeStyles(
            $style,
            $styleFillPink,
            $styleTextRed
        );

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex(self::ARCHIVEMENT_COL).$row,
            is_numeric($nilaiArchivement) ? number_format($nilaiArchivement, 2) : '-',
            $style
        );

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex(self::ARCHIVEMENT_INDICATOR_COL).$row,
            is_numeric($nilaiArchivementIndicator) ? number_format($nilaiArchivementIndicator, 2) : '-',
            $indicatorStyle
        );
    }

    /**
     * Add a total row for an aspect (sum of monthly values).
     *
     * @param  int|float|null  $totalArchivementByMasterReport
     */
    private function addTotalRowForAspect(
        Worksheet $sheet,
        Collection $totalNilaiByMasterReport,
        $totalArchivementByMasterReport
    ): void {
        $startColumnIndex = self::MONTH_DATA_START_COL;
        $currentRow = $this->positionTracker->nextRow();

        $styleLabel = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE
        );

        $this->addJumlahRowForAspect($sheet, $currentRow, 'Jumlah Nilai yang Diperoleh', $styleLabel);

        // Current year months
        foreach (range(1, self::MONTH_COUNT) as $month) {
            $key = sprintf('%d-%d', $this->year, $month);
            $value = $totalNilaiByMasterReport[$key] ?? null;
            $this->addTotalRowForAspectByMonth(
                $sheet,
                $currentRow,
                $startColumnIndex,
                $value,
                $styleLabel
            );
            $startColumnIndex += 2;
        }

        // Achievement column
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $startColumnIndex,
            $totalArchivementByMasterReport,
            $styleLabel
        );

        $startColumnIndex += 2;

        // December previous year
        $keyDecemberLastYear = sprintf('%d-%d', $this->year - 1, 12);
        $value = $totalNilaiByMasterReport[$keyDecemberLastYear] ?? null;
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $startColumnIndex,
            $value,
            $styleLabel
        );
    }

    /**
     * Add the "Jumlah" label row (merged A–E).
     */
    private function addJumlahRowForAspect(Worksheet $sheet, int $rowIndex, string $label, array $styleLabel): void
    {
        $styles = ExcelStyleManager::mergeStyles(
            $styleLabel,
            ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE
        );

        ExcelStyleManager::addCell(
            $sheet,
            'A'.$rowIndex,
            $label,
            $styles,
            colSpan: self::BASIC_INFO_COLUMNS
        );
    }

    /**
     * Add a single cell for a total value (with optional colspan).
     *
     * @param  int|float|string|null  $value
     */
    private function addTotalRowForAspectByMonth(
        Worksheet $sheet,
        int $rowIndex,
        int $columnIndex,
        $value,
        array $styleLabel,
        int $colSpan = 1
    ): void {
        if ($colSpan == 1) {
            // Empty cell for the first column of the month pair
            ExcelStyleManager::addCell(
                $sheet,
                Coordinate::stringFromColumnIndex($columnIndex).$rowIndex,
                '',
                $styleLabel
            );
        }

        $columnIndex = $colSpan > 1 ? $columnIndex : $columnIndex + 1;
        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex).$rowIndex,
            $value,
            $styleLabel,
            $colSpan
        );
    }

    /**
     * Add the "Total Kinerja" row for an aspect.
     *
     * @param  int|float|null  $totalArchivementByMasterReport
     */
    private function addTotalKinerjaRowForAspect(
        Worksheet $sheet,
        string $aspectName,
        Collection $nilaiKinerja,
        $totalArchivementByMasterReport
    ): void {
        $currentRow = $this->positionTracker->nextRow();
        $this->totalKinerjaCell1($sheet, $currentRow, $aspectName);
        $this->totalKinerjaCell2($sheet, $currentRow);

        $startColumnIndex = self::MONTH_DATA_START_COL;
        $styleLabel = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FORMAT_NUMBER_00_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::FONT_COLOR_RED_STYLE,
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE
        );

        // Current year months
        foreach (range(1, self::MONTH_COUNT) as $month) {
            $key = sprintf('%d-%d', $this->year, $month);
            $value = $nilaiKinerja[$key] ?? null;
            $this->addTotalRowForAspectByMonth(
                $sheet,
                $currentRow,
                $startColumnIndex,
                $value,
                $styleLabel
            );
            $startColumnIndex += 2;
        }

        // Achievement
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $startColumnIndex,
            $totalArchivementByMasterReport,
            $styleLabel
        );

        $startColumnIndex += 2;

        // December previous year
        $keyDecemberLastYear = sprintf('%d-%d', $this->year - 1, 12);
        $value = $nilaiKinerja[$keyDecemberLastYear] ?? null;
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $startColumnIndex,
            $value,
            $styleLabel
        );
    }

    /**
     * Add the left part of the Total Kinerja row (merged A–B).
     */
    private function totalKinerjaCell1(Worksheet $sheet, int $rowIndex, string $aspectName): void
    {
        $styles = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE
        );
        $shortName = explode('.', $aspectName)[1] ?? $aspectName;
        $title = sprintf('Total Kinerja %s', $shortName);
        ExcelStyleManager::addCell(
            $sheet,
            'A'.$rowIndex,
            $title,
            $styles,
            colSpan: 2
        );
    }

    /**
     * Add the description cell (C–E) for the Total Kinerja row.
     */
    private function totalKinerjaCell2(Worksheet $sheet, int $rowIndex): void
    {
        $styles = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE
        );

        ExcelStyleManager::addCell(
            $sheet,
            'C'.$rowIndex,
            '(Jumlah Perolehan Nilai : Nilai Maksimal) x Bobot',
            $styles,
            colSpan: 3
        );
    }

    /**
     * Add the final performance rows (NILAI KINERJA TOTAL and KINERJA).
     *
     * @param  string  $fieldKey  'total' or 'nilaiPerformance'
     */
    private function addNilaiPerformaRow(
        Worksheet $sheet,
        Collection $totalNilaiPerformanceByYearMonth,
        string $fieldKey
    ): void {
        $currentRow = $this->positionTracker->nextRow();

        $styleLabel = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE,
        );

        $label = $fieldKey === 'total' ? 'NILAI KINERJA TOTAL' : 'KINERJA';

        ExcelStyleManager::addCell(
            $sheet,
            'A'.$currentRow,
            $label,
            $styleLabel,
            colSpan: self::BASIC_INFO_COLUMNS
        );

        $styleFormatNumber = $fieldKey === 'total'
            ? ExcelStyleManager::FORMAT_NUMBER_00_STYLE
            : [];

        $styleValue = ExcelStyleManager::mergeStyles(
            $styleLabel,
            $styleFormatNumber,
        );

        $columnIndex = self::MONTH_DATA_START_COL;
        $colspan = $fieldKey === 'total' ? 1 : 2;

        // Current year months
        foreach (range(1, self::MONTH_COUNT) as $month) {
            $key = sprintf('%d-%d', $this->year, $month);
            $value = $totalNilaiPerformanceByYearMonth[$key][$fieldKey] ?? null;
            $this->addTotalRowForAspectByMonth(
                $sheet,
                $currentRow,
                $columnIndex,
                $value,
                $styleValue,
                $colspan
            );
            $columnIndex += 2;
        }

        // Achievement (year-00)
        $value = $totalNilaiPerformanceByYearMonth["{$this->year}-00"][$fieldKey] ?? null;
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $columnIndex,
            $value,
            $styleValue,
            $colspan
        );

        $columnIndex += 2;

        // December previous year
        $key = sprintf('%d-%d', $this->year - 1, 12);
        $value = $totalNilaiPerformanceByYearMonth[$key][$fieldKey] ?? null;
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $columnIndex,
            $value,
            $styleValue,
            $colspan
        );
    }

    /**
     * Generate the three-row header structure.
     */
    private function generateHeaders(): void
    {
        $mainHeaders = [
            new CellHelper('#', width: 10, rowspan: 3),
            new CellHelper(value: 'Indikator', width: 50, rowspan: 3),
            new CellHelper(value: 'Rumus', width: 75, rowspan: 3),
            new CellHelper(value: 'Satuan', width: 12, rowspan: 3),
            new CellHelper(value: 'Bobot', width: 10, rowspan: 3),
        ];

        $monthHeaders = array_map(
            fn ($month) => new CellHelper(value: "{$month} {$this->year}", colspan: 2, rowspan: 2),
            DateHelper::$monthList
        );

        $pencapaianHeaders = [
            new CellHelper(value: 'Pencapaian Total', colspan: 2, wrapText: true),
            new CellHelper(value: sprintf('Pencapaian Tahun %d', $this->year - 1), colspan: 2, rowspan: 2, wrapText: true),
        ];

        $sdBulan = [
            new CellHelper(
                value: sprintf(
                    'Sd. Bulan %s',
                    DateHelper::getMonthName($this->lastInputMonth)
                ),
                colspan: 2,
                wrapText: true
            ),
        ];

        $childNilaiHeader = [
            new CellHelper(value: 'Nilai Pencapaian', width: 12, wrapText: true),
            new CellHelper(value: 'Nilai Indikator', width: 10, wrapText: true),
        ];

        $nilaiHeader = array_fill(0, self::MONTH_COUNT + 2, $childNilaiHeader);

        $this->headerCells = [
            array_merge($mainHeaders, $monthHeaders, $pencapaianHeaders),
            $sdBulan,
            array_merge(...$nilaiHeader),
        ];
    }

    /**
     * Create the Excel configuration object.
     */
    private function createExcelConfiguration(): void
    {
        $this->excelConfig = ExcelConfiguration::create()
            ->withHeaders($this->headerCells)
            ->withSheetTitle(sprintf('Laporan %s', $this->reportTypeName))
            ->withZebraStriping(true);
    }

    /**
     * Convert column index to letter.
     */
    private function getColumnLetter(int $columnIndex): string
    {
        return Coordinate::stringFromColumnIndex($columnIndex);
    }
}
