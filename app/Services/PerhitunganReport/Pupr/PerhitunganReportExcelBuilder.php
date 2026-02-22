<?php

namespace App\Services\PerhitunganReport\Pupr;

use App\Data\ExcelConfiguration;
use App\Helpers\CellHelper;
use App\Helpers\DateHelper;
use App\Models\Master\Aspects;
use App\Models\Master\MasterReports;
use App\Models\Transaksi\PerhitunganReports;
use App\Services\Excel\ExcelStyleManager;
use App\Services\Excel\PositionTracker;
use App\Services\Excel\PositionTrackerBuilder;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PerhitunganReportExcelBuilder
{
    private const TITLE_ROW_HEIGHT = 2;

    private const MONTH_COUNT = 12;

    private const BASIC_INFO_COLUMNS = 5; // A to E

    private const MONTH_DATA_START_COL = 6; // F

    private const ARCHIVEMENT_COL = 42; // AP

    private const ARCHIVEMENT_INDICATOR_COL = 43; // AQ

    private const ARCHIVEMENT_BOBOT_COL = 44; // AR

    private const TOTAL_COLUMNS = 47; // up to column AU (for merging)

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

    public function build(array $data): Spreadsheet
    {
        $this->initializeSpreadsheet();
        $this->addTitleRow();
        $this->addDataRows($data);
        $this->adjustColumnWidths();

        return $this->spreadsheet;
    }

    private function initializeSpreadsheet(): void
    {
        $this->spreadsheet = new Spreadsheet;
        ExcelStyleManager::setDocumentProperties($this->spreadsheet, $this->excelConfig);
        $sheet = $this->spreadsheet->getActiveSheet();
        $sheet->setTitle($this->excelConfig->sheetTitle);
    }

    private function addTitleRow(): void
    {
        $sheet = $this->spreadsheet->getActiveSheet();
        $titles = [
            'PROYEKSI PENILAIAN KINERJA PERUMDAM TIRTA SATRIA',
            sprintf('TAHUN %d BERDASARKAN FORMULASI PUPR', $this->year),
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

    private function addDataRows(array $data): void
    {
        $this->generateReportTypeSections($data);
    }

    private function adjustColumnWidths(): void
    {
        foreach (range('A', 'E') as $col) {
            $this->spreadsheet->getActiveSheet()
                ->getColumnDimension($col)
                ->setAutoSize(false);
        }
    }

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
                $data['groupedArchivementByAspect'][$aspectId] ?? collect()
            );
            $this->addTotalRowForAspect(
                $sheet,
                $data['totalNilaiByAspect'][$aspectId] ?? collect(),
                $data['totalArchivementByAspect'][$aspectId] ?? collect(),
            );

            $this->positionTracker = $this->positionTracker->advanceRows(1);
        }

        $this->addNilaiPerformaRow($sheet, $data['totalNilaiPerformanceByYearMonth'] ?? collect(), 'total');
        $this->addNilaiPerformaRow($sheet, $data['totalNilaiPerformanceByYearMonth'] ?? collect(), 'nilaiPerformance');
    }

    /**
     * Add all data rows for a given aspect.
     */
    private function addDataRowsForAspect(Worksheet $sheet, Collection $dataRows, Collection $groupedReports, Collection $groupedArchivement): void
    {
        foreach ($dataRows as $masterReport) {
            $masterReportId = $masterReport->id;
            $this->addReportRows(
                $sheet,
                $masterReport,
                $groupedReports[$masterReportId] ?? collect(),
                $groupedArchivement[$masterReportId] ?? collect()
            );
        }
    }

    private function addReportRows(Worksheet $sheet, MasterReports $masterReport, Collection $reports, Collection $archivements): void
    {
        $currentRow = $this->positionTracker->nextRow();

        $this->addBasicInfoCells($sheet, $currentRow, $masterReport);
        $this->addMonthlyDataCells($sheet, $currentRow, $reports);
        $this->addArchivementCells($sheet, $currentRow, $archivements);
    }

    private function addBasicInfoCells(Worksheet $sheet, int $row, MasterReports $masterReport): void
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

    private function addMonthlyDataCells(Worksheet $sheet, int $row, Collection $reports): void
    {
        $columnIndex = self::MONTH_DATA_START_COL;

        // Months of current year
        foreach (range(1, self::MONTH_COUNT) as $month) {
            $key = sprintf('%d-%d', $this->year, $month);
            $report = $reports[$key] ?? null;
            $this->addDetailCellsForMonth($sheet, $row, $columnIndex, $report);
            $columnIndex += 3;
        }

        $columnIndex += 3; // skip three columns? (original code had extra +2 after loop, then another +2 before last year)

        // December of previous year
        $reportDecemberLastYear = $reports[sprintf('%d-%d', $this->year - 1, 12)] ?? null;
        $this->addDetailCellsForMonth($sheet, $row, $columnIndex, $reportDecemberLastYear);
    }

    private function addDetailCellsForMonth(Worksheet $sheet, int $row, int $columnIndex, ?PerhitunganReports $report): void
    {
        $nilai = $report->nilai ?? null;
        $nilaiIndicator = $report->nilai_indicator ?? null;
        $nilai_bobot = $report->nilai_bobot ?? null;

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

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex + 2).$row,
            is_numeric($nilai_bobot) ? number_format($nilai_bobot, 2) : '-',
            $baseSytle
        );
    }

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
            3
        );

        ExcelStyleManager::applyHeaderStyle(
            $sheet,
            $this->headerCells[2],
            $this->excelConfig,
            $this->positionTracker->nextRow(),
            6
        );
    }

    private function addAspectRow(Worksheet $sheet, Aspects $aspect): void
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

    private function addArchivementCells(Worksheet $sheet, int $row, Collection $archivement): void
    {
        $nilaiArchivement = $archivement['nilai_archivement'] ?? null;
        $nilaiArchivementIndicator = $archivement['nilai_archivement_indicator'] ?? null;
        $nilaiBobotArchivement = $archivement['nilai_bobot_archivement'] ?? null;

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

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex(self::ARCHIVEMENT_BOBOT_COL).$row,
            is_numeric($nilaiBobotArchivement) ? number_format($nilaiBobotArchivement, 2) : '-',
            $style
        );
    }

    private function addTotalRowForAspect(
        Worksheet $sheet,
        Collection $totalNilaiByMasterReport,
        int|float|null $totalArchivementByMasterReport
    ): void {
        $startColumnIndex = self::MONTH_DATA_START_COL;
        $currentRow = $this->positionTracker->nextRow();

        $styleLabel = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE
        );

        ExcelStyleManager::addCell(
            $sheet,
            'A'.$currentRow,
            'NILAI KINERJA ASPEK KEUANGAN',
            $styleLabel,
            colSpan: self::BASIC_INFO_COLUMNS
        );

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
            $startColumnIndex += 3;
        }

        // Achievement column
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $startColumnIndex,
            $totalArchivementByMasterReport,
            $styleLabel
        );

        $startColumnIndex += 3;

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

    private function addTotalRowForAspectByMonth(
        Worksheet $sheet,
        int $rowIndex,
        int $columnIndex,
        int|float|string|null $value,
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

            ExcelStyleManager::addCell(
                $sheet,
                Coordinate::stringFromColumnIndex($columnIndex + 1).$rowIndex,
                '',
                $styleLabel
            );
        }

        $columnIndex = $colSpan > 1 ? $columnIndex : $columnIndex + 2; // Move to the next month if not spanning
        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex).$rowIndex,
            $value,
            $styleLabel,
            $colSpan
        );
    }

    private function addNilaiPerformaRow(
        Worksheet $sheet,
        Collection $totalNilaiBobotArchivementByMonth,
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
        $colspan = $fieldKey === 'total' ? 1 : 3;

        // Current year months
        foreach (range(1, self::MONTH_COUNT) as $month) {
            $key = sprintf('%d-%d', $this->year, $month);
            $value = $totalNilaiBobotArchivementByMonth[$key][$fieldKey] ?? null;
            $this->addTotalRowForAspectByMonth(
                $sheet,
                $currentRow,
                $columnIndex,
                $value,
                $styleValue,
                $colspan
            );
            $columnIndex += 3;
        }

        // Achievement (year-00)
        $value = $totalNilaiBobotArchivementByMonth["{$this->year}-00"][$fieldKey] ?? null;
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $columnIndex,
            $value,
            $styleValue,
            $colspan
        );

        $columnIndex += 3;

        // December previous year
        $key = sprintf('%d-%d', $this->year - 1, 12);
        $value = $totalNilaiBobotArchivementByMonth[$key][$fieldKey] ?? null;
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $columnIndex,
            $value,
            $styleValue,
            $colspan
        );
    }

    private function generateHeaders(): void
    {
        $mainHeaders = [
            new CellHelper('#', width: 10, rowspan: 3),
            new CellHelper(value: 'Indikator', width: 50, rowspan: 3),
            new CellHelper(value: 'Rumus', width: 75, rowspan: 3),
            new CellHelper(value: 'Satuan', width: 12, rowspan: 3),
            new CellHelper(value: 'Bobot (%)', width: 10, rowspan: 3),
        ];

        $monthHeaders = array_map(
            fn ($month) => new CellHelper(
                value: "{$month} {$this->year}",
                colspan: 3,
                rowspan: 2
            ),
            DateHelper::$monthList
        );

        $pencapaianHeaders = [
            new CellHelper(value: 'Pencapaian Total', colspan: 3, wrapText: true),
            new CellHelper(
                value: sprintf('Pencapaian Tahun %d', $this->year - 1),
                colspan: 3,
                rowspan: 2,
                wrapText: true
            ),
        ];

        $sdBulan = [
            new CellHelper(
                value: sprintf(
                    'Sd. Bulan %s %d',
                    DateHelper::getMonthName($this->lastInputMonth),
                    $this->year
                ),
                colspan: 3,
                wrapText: true
            ),
        ];

        $childNilaiHeader = [
            new CellHelper(value: 'Nilai Pencapaian', width: 12, wrapText: true),
            new CellHelper(value: 'Nilai Indikator', width: 12, wrapText: true),
            new CellHelper(value: 'Hasil', width: 12, wrapText: true),
        ];

        $nilaiHeader = array_fill(0, self::MONTH_COUNT + 2, $childNilaiHeader);

        $this->headerCells = [
            array_merge($mainHeaders, $monthHeaders, $pencapaianHeaders),
            $sdBulan,
            array_merge(...$nilaiHeader),
        ];
    }

    private function createExcelConfiguration(): void
    {
        $this->excelConfig = ExcelConfiguration::create()
            ->withHeaders($this->headerCells)
            ->withSheetTitle(sprintf('Laporan %s', $this->reportTypeName))
            ->withZebraStriping(true);
    }

    private function getColumnLetter(int $columnIndex): string
    {
        return Coordinate::stringFromColumnIndex($columnIndex);
    }
}
