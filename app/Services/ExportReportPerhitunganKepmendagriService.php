<?php

namespace App\Services;

use App\Data\ExcelConfiguration;
use App\Helpers\CellHelper;
use App\Helpers\DateHelper;
use App\Helpers\FormulaHelper;
use App\Helpers\FormulaPerformanceHelper;
use App\Models\Master\Aspects;
use App\Models\Master\MasterReports;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use App\Models\Transaksi\RekapInputTahunans;
use App\Services\Excel\ExcelStyleManager;
use App\Services\Excel\PositionTracker;
use App\Services\Excel\PositionTrackerBuilder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;


/**
 * Service to generate and export the "Perhitungan Kepmendagri" report as an Excel file.
 *
 * This service builds a spreadsheet based on report type, year, and optional search filter.
 * It organizes data, applies styles, and stores the file in the exports directory.
 *
 * @author 2026
 */
class ExportReportPerhitunganKepmendagriService
{
    /** @var string Directory where exports are stored */
    private const EXPORTS_DIRECTORY = 'exports';

    /** @var int Number of title rows */
    private const TITLE_ROW_HEIGHT = 2;

    /** @var int Number of months in a year */
    private const MONTH_COUNT = 12;

    /** @var int The year for the report */
    private int $year;

    /** @var string The report type identifier */
    private string $report_type_id;

    /** @var string|null Optional search filter */
    private ?string $search;

    /** @var ReportTypes|null The report type model */
    private ?ReportTypes $reportType = null;

    /** @var string The generated file name */
    public string $fileName;

    /** @var Spreadsheet The spreadsheet instance */
    private Spreadsheet $spreadsheet;

    /** @var ExcelConfiguration The Excel configuration */
    private ExcelConfiguration $excelConfig;

    /** @var PositionTracker Tracks the current row position */
    private PositionTracker $positionTracker;

    /** @var array Header cell definitions */
    private array $headerCells = [];

    /** @var int The last input month in the year */
    private int $lastInputMonth;

    /**
     * Constructor.
     *
     * @param int $year
     * @param string $report_type_id
     * @param string|null $search
     */
    public function __construct(int $year, string $report_type_id, ?string $search = null)
    {
        $this->year = $year;
        $this->report_type_id = $report_type_id;
        $this->search = $search;
        $this->initializeService();
    }

    /**
     * Initialize the service: set up position tracker, base data, file name, headers, and Excel config.
     */
    private function initializeService(): void
    {
        $this->positionTracker = (new PositionTrackerBuilder)
            ->startRow(1)
            ->build();
        $this->prepareBaseData();
        $this->generateFileName();
        $this->generateHeaders();
        $this->createExcelConfiguration();
    }

    /**
     * Generate the report and store the Excel file.
     *
     * @return string The file path of the saved Excel file
     */
    public function generateAndStore(): string
    {
        $this->initializeSpreadsheet();
        $this->addTitleRow();
        $this->addDataRows();
        return $this->saveExcelFile();
    }

    /**
     * Initialize the spreadsheet and set document properties.
     */
    private function initializeSpreadsheet(): void
    {
        $this->spreadsheet = new Spreadsheet();
        ExcelStyleManager::setDocumentProperties($this->spreadsheet, $this->excelConfig);
        $sheet = $this->spreadsheet->getActiveSheet();
        $sheet->setTitle($this->excelConfig->sheetTitle);
    }

    /**
     * Add the title rows to the spreadsheet.
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
                'A' . $currentRow,
                $line,
                ExcelStyleManager::mergeStyles(
                    ExcelStyleManager::FONT_BOLD_16_STYLE,
                    ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE
                )
            );
            $lastColumn = $this->getLastColumnIndex();
            $sheet->mergeCells("A{$currentRow}:{$lastColumn}{$currentRow}");
        }
        $this->positionTracker = $this->positionTracker->advanceRows(self::TITLE_ROW_HEIGHT);
    }

    /**
     * Add all data rows and sections to the spreadsheet.
     */
    private function addDataRows(): void
    {
        $data = $this->prepareData();
        $this->generateReportTypeSections($data);
        foreach (range('A', 'E') as $col) {
            $this->spreadsheet->getActiveSheet()
                ->getColumnDimension($col)
                ->setAutoSize(false);
        }
    }


    /**
     * Prepare and organize all data needed for the report.
     *
     * @return array Organized data for report generation
     */
    private function prepareData(): array
    {
        $masterReports = $this->getMasterReports();
        $reports = $this->getReports();
        $archivementData = $reports
            ->filter(fn($report) => $report->month == $this->lastInputMonth)
            ->keyBy('master_report_id')
            ->map(fn($report) => [
                'master_report_id' => $report->master_report_id,
                'aspect_id' => $report->masterReport->aspect_id,
                'nilai_archivement' => $report->nilai_archivement,
                'nilai_archivement_indicator' => $report->nilai_archivement_indicator,
            ]);
        $reportsDecemberLastYear = $this->getReportsDecemberLastYear();
        $reportData = $reports->merge($reportsDecemberLastYear);
        $aspects = $this->getAspects();
        return $this->organizeData(
            $masterReports,
            $reportData,
            $aspects,
            $archivementData
        );
    }


    /**
     * Get all master reports for the current report type.
     *
     * @return Collection
     */
    private function getMasterReports(): Collection
    {
        return MasterReports::where('report_type_id', $this->reportType->id)
            ->orderBy('aspect_id')
            ->orderBy('seq')
            ->orderBy('urut')
            ->get();
    }


    /**
     * Get all reports for the current year and report type.
     *
     * @return Collection
     */
    private function getReports(): Collection
    {
        return PerhitunganReports::getPerhitunganReports(
            $this->year,
            $this->reportType->id,
            $this->search,
            true
        );
    }


    /**
     * Get December reports from the previous year for the current report type.
     *
     * @return Collection
     */
    private function getReportsDecemberLastYear(): Collection
    {
        return PerhitunganReports::getDecemberLastYearReports(
            $this->year - 1,
            $this->reportType->id,
            $this->search
        );
    }


    /**
     * Get RekapInputTahunans for the current year and report type.
     *
     * @return Collection
     */
    private function getRekapInputTahunans(): Collection
    {
        return RekapInputTahunans::where('year', $this->year)
            ->where('report_type_id', $this->reportType->id)
            ->get();
    }


    /**
     * Get all aspects for the current report type.
     *
     * @return Collection
     */
    private function getAspects(): Collection
    {
        return Aspects::where('report_type_id', $this->reportType->id)
            ->get(['id', 'name', 'max_score', 'weight']);
    }


    /**
     * Organize and group all report data for easier spreadsheet generation.
     *
     * @param Collection $masterReports
     * @param Collection $reportData
     * @param Collection $aspects
     * @param Collection $archivementData
     * @return array
     */
    private function organizeData(Collection $masterReports, Collection $reportData, Collection $aspects, Collection $archivementData): array
    {
        $groupedMasterReports = $masterReports->groupBy('aspect_id');
        $groupedReports = $reportData
            ->groupBy(fn($item) => $item->masterReport->aspect_id)
            ->map(fn($aspectGroup) => $aspectGroup->groupBy('master_report_id')
                ->map(fn($masterReportGroup) => $masterReportGroup->keyBy(fn($item) => sprintf('%d-%d', $item->year, $item->month))));
        $groupedArchivementByAspect = $archivementData
            ->groupBy('aspect_id')
            ->map(fn($group) => $group->keyBy('master_report_id'));

        $totalNilaiByAspect = [];
        $totalArchivementByAspect = [];
        $totalNilaiKinerjaByAspect = [];
        $totalNilaiArchivementByAspect = [];
        foreach ($aspects as $aspect) {
            $aspectId = $aspect->id;
            $maxScore = $aspect->max_score ?? 0;
            $weight = $aspect->weight ?? 0;
            $grouped = $reportData
                ->where(fn($item) => $item->masterReport->aspect_id == $aspectId)
                ->groupBy(fn($item) => sprintf('%d-%d', $item->year, $item->month))
                ->map(fn($subGroup) => $subGroup->sum('nilai_indicator'));
            $groupedArchivement = $archivementData
                ->where(fn($item) => $item['aspect_id'] == $aspectId)
                ->sum('nilai_archivement_indicator');
            $totalNilaiByAspect[$aspectId] = $grouped;
            $totalArchivementByAspect[$aspectId] = $groupedArchivement;
            $totalNilaiKinerjaByAspect[$aspectId] = $grouped
                ->map(function ($item) use ($maxScore, $weight) {
                    $formula = $item && $item > 0 ? sprintf('( %d / %d ) * %d', $item, $maxScore, $weight) : '0';
                    return FormulaHelper::evaluateFormula($formula);
                });
            $formulaArchivement = $groupedArchivement && $groupedArchivement > 0
                ? sprintf('( %d / %d ) * %d', $groupedArchivement, $maxScore, $weight)
                : '0';
            $totalNilaiArchivementByAspect[$aspectId] = FormulaHelper::evaluateFormula($formulaArchivement);
        }

        // Aggregate total performance by year-month
        $totalNilaiPerformanceByYearMonth = collect($totalNilaiKinerjaByAspect)
            ->reduce(function ($carry, $nilaiKinerjaByYearMonth) {
                foreach ($nilaiKinerjaByYearMonth as $yearMonth => $nilaiKinerja) {
                    if (!isset($carry[$yearMonth])) {
                        $carry[$yearMonth] = ['total' => 0];
                    }
                    $carry[$yearMonth]['total'] += $nilaiKinerja;
                }
                return $carry;
            }, []);

        $formulaPerformance = $this->reportType->formula_performance ?? '';
        foreach ($totalNilaiPerformanceByYearMonth as $yearMonth => $data) {
            $nilaiPerformance = FormulaPerformanceHelper::evaluateFormulaWithVariables($formulaPerformance, $data['total']);
            $totalNilaiPerformanceByYearMonth[$yearMonth]['nilaiPerformance'] = $nilaiPerformance;
        }

        $archivementTotal = collect($totalNilaiArchivementByAspect)->sum();
        $totalNilaiPerformanceByYearMonth["{$this->year}-00"]['total'] = $archivementTotal;
        $totalNilaiPerformanceByYearMonth["{$this->year}-00"]['nilaiPerformance'] = FormulaPerformanceHelper::evaluateFormulaWithVariables($formulaPerformance, $archivementTotal);

        return [
            'masterReports' => $groupedMasterReports,
            'reports' => $groupedReports,
            'aspects' => $aspects,
            'groupedArchivement' => $groupedArchivementByAspect,
            'totalNilaiByAspect' => $totalNilaiByAspect,
            'totalArchivementByAspect' => $totalArchivementByAspect,
            'totalNilaiKinerjaByAspect' => $totalNilaiKinerjaByAspect,
            'totalNilaiArchivementByAspect' => $totalNilaiArchivementByAspect,
            'totalNilaiPerformanceByYearMonth' => collect($totalNilaiPerformanceByYearMonth),
        ];
    }


    /**
     * Generate all report sections for each aspect and add them to the spreadsheet.
     *
     * @param array $data
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
                $data['groupedArchivement'][$aspectId] ?? collect(),
            );
            $this->addTotalRowForAspect(
                $sheet,
                $data['totalNilaiByAspect'][$aspectId] ?? collect(),
                $data['totalArchivementByAspect'][$aspectId] ?? collect()
            );
            $this->addTotalKinerjaRowForAspect(
                $sheet,
                $aspect['name'],
                $data['totalNilaiKinerjaByAspect'][$aspectId] ?? 0,
                $data['totalNilaiArchivementByAspect'][$aspectId] ?? 0
            );
            $this->positionTracker = $this->positionTracker->advanceRows(1);
        }
        $this->addNilaiPerformaRow($sheet, $data['totalNilaiPerformanceByYearMonth'] ?? collect(), 'total');
        $this->addNilaiPerformaRow($sheet, $data['totalNilaiPerformanceByYearMonth'] ?? collect(), 'nilaiPerformance');
    }

    private function addTableHeader(Worksheet $sheet)
    {
        ExcelStyleManager::applyHeaderStyle(
            $sheet,
            $this->headerCells[0],
            $this->excelConfig,
            $this->positionTracker->nextRow()
        );

        $column = Coordinate::stringFromColumnIndex(30);
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

    private function addAspectRow(Worksheet $sheet, Aspects $aspect)
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
            'A' . $currentRow,
            $aspect->name,
            $styles,
            colSpan: 33
        );
    }

    private function addDataRowsForAspect(Worksheet $sheet, Collection $dataRows, Collection $groupedReports, Collection $groupedArchivement)
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

    private function addReportRows(Worksheet $sheet, MasterReports $masterReport, Collection $reports, $archivements)
    {
        $currentRow = $this->positionTracker->nextRow();

        $this->addBasicInfoCells($sheet, $currentRow, $masterReport);

        $this->addMonthlyDataCells($sheet, $currentRow, $reports);

        $this->addArchivementCells($sheet, $currentRow, $archivements);
    }

    private function addBasicInfoCells(Worksheet $sheet, int $row, MasterReports $masterReport)
    {
        $bobot = (float) $masterReport['weight'];
        $cells = [
            'A' => ['value' => trim($masterReport->urut)],
            'B' => ['value' => trim($masterReport->desc_indicator)],
            'C' => ['value' => trim($masterReport->desc_formula)],
            'D' => ['value' => trim($masterReport->unit)],
            'E' => ['value' => $bobot > 0 ? number_format($bobot, 2) : '-'],
        ];

        $style = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE,
            ExcelStyleManager::ALL_BORDER_STYLE
        );

        foreach ($cells as $column => $cell) {
            $coordinate = $column . $row;
            ExcelStyleManager::addCell(
                $sheet,
                $coordinate,
                (string) $cell['value'],
                $style
            );
        }
    }

    private function addMonthlyDataCells(Worksheet $sheet, int $rowIndex, Collection $reports)
    {
        $columnIndex = 6; // Starting from column F
        foreach (range(1, self::MONTH_COUNT) as $month) {
            $key = sprintf('%d-%d', $this->year, $month);
            $report = $reports[$key] ?? null;
            $this->addDetailCellsForMonth($sheet, $rowIndex, $columnIndex, $report);
            $columnIndex += 2; // Move to the next month (2 columns per month)
        }
        $columnIndex += 2;

        $reportDecemberLastYear = $reports[sprintf('%d-%d', $this->year - 1, 12)] ?? null;
        $this->addDetailCellsForMonth($sheet, $rowIndex, $columnIndex, $reportDecemberLastYear);
    }

    private function addDetailCellsForMonth(Worksheet $sheet, int $rowIndex, int $columnIndex, ?PerhitunganReports $report)
    {
        $nilai = $report->nilai ?? null;
        $nilaiIndicator = $report->nilai_indicator ?? null;
        // $nilaiBobot = $report->nilai_bobot ?? null;

        $style = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALIGN_RIGHT_CENTER_STYLE,
            ExcelStyleManager::ALL_BORDER_STYLE
        );

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex) . $rowIndex,
            is_numeric($nilai) ? number_format($nilai, 2) : '-',
            $style
        );
        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex + 1) . $rowIndex,
            is_numeric($nilaiIndicator) ? number_format($nilaiIndicator, 2) : '-',
            $style
        );
    }

    private function addArchivementCells(Worksheet $sheet, int $row, array $archivement)
    {
        $nilaiArchivement = $archivement['nilai_archivement'] ?? null;
        $nilaiArchivementIndicator = $archivement['nilai_archivement_indicator'] ?? null;

        $style = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALIGN_RIGHT_CENTER_STYLE,
            ExcelStyleManager::ALL_BORDER_STYLE
        );

        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex(30) . $row,
            is_numeric($nilaiArchivement) ? number_format($nilaiArchivement, 2) : '-',
            $style
        );
        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex(31) . $row,
            is_numeric($nilaiArchivementIndicator) ? number_format($nilaiArchivementIndicator, 2) : '-',
            $style
        );
    }

    private function addTotalRowForAspect(Worksheet $sheet, Collection $totalNilaiByMasterReport, ?int $totalArchivementByMasterReport)
    {
        $startColumnIndex = 6;
        $currentRow = $this->positionTracker->nextRow();

        $styleLabel = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
        );

        $this->addJumlahRowForAspect($sheet, $currentRow, 'Jumlah Nilai yang Diperoleh', $styleLabel);

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

        $valueArchivement = $totalArchivementByMasterReport;
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $startColumnIndex,
            $valueArchivement,
            $styleLabel
        );

        $keyDecemberLastYear = sprintf('%d-%d', $this->year - 1, 12);
        $value = $totalNilaiByMasterReport[$keyDecemberLastYear] ?? null;

        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $startColumnIndex + 2,
            $value,
            $styleLabel
        );
    }

    private function addJumlahRowForAspect(Worksheet $sheet, int $rowIndex, string $label, array $styleLabel)
    {
        $styles = ExcelStyleManager::mergeStyles(
            $styleLabel,
            ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE
        );
        ExcelStyleManager::addCell(
            $sheet,
            'A' . $rowIndex,
            $label,
            $styles,
            colSpan: 5
        );
    }

    /**
     * Summary of addTotalRowForAspectByMonth
     * @param Worksheet $sheet
     * @param int $rowIndex
     * @param int $columnIndex
     * @param int|float|string|null $value
     * @param array $styleLabel
     * @param int|null $colSpan
     * @return void
     */

    private function addTotalRowForAspectByMonth(
        Worksheet $sheet,
        int $rowIndex,
        int $columnIndex,
        int|float|string|null $value,
        array $styleLabel,
        ?int $colSpan = 1
    ) {
        if ($colSpan == 1) {
            ExcelStyleManager::addCell(
                $sheet,
                Coordinate::stringFromColumnIndex($columnIndex) . ($rowIndex),
                '',
                $styleLabel
            );
        }

        $columnIndex = $colSpan > 1 ? $columnIndex : $columnIndex + 1;
        ExcelStyleManager::addCell(
            $sheet,
            Coordinate::stringFromColumnIndex($columnIndex) . ($rowIndex),
            $value,
            $styleLabel,
            $colSpan
        );
    }

    private function addTotalKinerjaRowForAspect(
        Worksheet $sheet,
        string $aspectName,
        Collection $nilaiKinerja,
        int|float|string|null $totalArchivementByMasterReport
    ) {

        $currentRow = $this->positionTracker->nextRow();
        $this->totalKinerjaCell1($sheet, $currentRow, $aspectName);
        $this->totalKinerjaCell2($sheet, $currentRow);

        $startColumnIndex = 6;
        $styleLabel = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FORMAT_NUMBER_00_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
        );

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

        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $startColumnIndex,
            $totalArchivementByMasterReport,
            $styleLabel
        );

        $keyDecemberLastYear = sprintf('%d-%d', $this->year - 1, 12);
        $value = $nilaiKinerja[$keyDecemberLastYear] ?? null;

        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $startColumnIndex + 2,
            $value,
            $styleLabel
        );
    }

    private function totalKinerjaCell1(Worksheet $sheet, int $rowIndex, string $aspectName)
    {
        $styles = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE
        );
        $title = sprintf('Total Kinerja %s', explode('.', $aspectName)[1] ?? $aspectName);
        ExcelStyleManager::addCell(
            $sheet,
            'A' . $rowIndex,
            $title,
            $styles,
            colSpan: 2
        );
    }

    private function totalKinerjaCell2(Worksheet $sheet, int $rowIndex)
    {
        $styles = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE
        );

        ExcelStyleManager::addCell(
            $sheet,
            'C' . $rowIndex,
            "(Jumlah Perolehan Nilai : Nilai Maksimal) x Bobot",
            $styles,
            colSpan: 3
        );
    }

    private function addNilaiPerformaRow(Worksheet $sheet, Collection $totalNilaiPerformanceByYearMonth, string $fieldKey)
    {
        $currentRow = $this->positionTracker->nextRow();

        $styleLabel = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE
        );

        $label = $fieldKey === "total" ? "NILAI KINERJA TOTAL" : "KINERJA";

        ExcelStyleManager::addCell(
            $sheet,
            'A' . $currentRow,
            $label,
            $styleLabel,
            colSpan: 5
        );

        $styleAlign = $fieldKey === "total" ?
            ExcelStyleManager::ALIGN_RIGHT_CENTER_STYLE :
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE;
        $styleFormatNumber = $fieldKey === "total" ?
            ExcelStyleManager::FORMAT_NUMBER_00_STYLE : [];
        $styleLabel = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::ALL_BORDER_STYLE,
            ExcelStyleManager::FONT_BOLD_12_STYLE,
            ExcelStyleManager::FILL_SOLID_LIGHT_YELLOW_STYLE,
            $styleAlign,
            $styleFormatNumber,
        );

        $columnIndex = 6;
        $colspan = $fieldKey === "total" ? 1 : 2;
        foreach (range(1, self::MONTH_COUNT) as $month) {
            $key = sprintf('%d-%d', $this->year, $month);
            $value = $totalNilaiPerformanceByYearMonth[$key][$fieldKey] ?? null;

            $this->addTotalRowForAspectByMonth(
                $sheet,
                $currentRow,
                $columnIndex,
                $value,
                $styleLabel,
                $colspan
            );
            $columnIndex += 2;
        }

        $value = $totalNilaiPerformanceByYearMonth["{$this->year}-00"][$fieldKey] ?? null;
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $columnIndex,
            $value,
            $styleLabel,
            $colspan
        );

        $columnIndex += 2;

        $key = sprintf('%d-%d', $this->year - 1, 12);
        $value = $totalNilaiPerformanceByYearMonth[$key][$fieldKey] ?? null;
        $this->addTotalRowForAspectByMonth(
            $sheet,
            $currentRow,
            $columnIndex,
            $value,
            $styleLabel,
            $colspan
        );
    }

    private function prepareBaseData(): void
    {
        $this->reportType = ReportTypes::whereSqid($this->report_type_id)->first();
        $this->lastInputMonth = PerhitunganReports::query()
            ->where('year', $this->year)
            ->pluck('month')
            ->max();
    }


    /**
     * Generate a unique file name for the export.
     */
    private function generateFileName(): void
    {
        $timestamp = now()->format('Ymd_His');
        $this->fileName = sprintf(
            'Report_Perhitungan_%s_%d_%s.xlsx',
            $this->reportType->name,
            $this->year,
            $timestamp
        );
    }

    private function generateHeaders()
    {
        $mainHeaders = [
            new CellHelper('#', width: 10, rowspan: 3),
            new CellHelper(value: 'Indikator', width: 50, rowspan: 3),
            new CellHelper(value: 'Rumus', width: 75, rowspan: 3),
            new CellHelper(value: 'Satuan', width: 12, rowspan: 3),
            new CellHelper(value: 'Bobot', width: 10, rowspan: 3),
        ];

        $monthHeaders = array_map(
            fn($month) => new CellHelper(value: "{$month} {$this->year}", colspan: 2, rowspan: 2),
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

        $nilaiHeader = array_fill(
            0,
            self::MONTH_COUNT + 2,
            $childNilaiHeader,
        );

        $this->headerCells = [
            array_merge(
                $mainHeaders,
                $monthHeaders,
                $pencapaianHeaders,
            ),
            $sdBulan,
            array_merge(...$nilaiHeader),
        ];
    }

    private function createExcelConfiguration(): void
    {
        $this->excelConfig = ExcelConfiguration::create()
            ->withHeaders($this->headerCells)
            ->withSheetTitle(sprintf('Laporan %s', $this->reportType->name))
            ->withZebraStriping(true);
    }

    private function saveExcelFile(): string
    {
        $filePath = storage_path(sprintf('app/%s/%s', self::EXPORTS_DIRECTORY, $this->fileName));

        // Ensure directory exists
        Storage::makeDirectory(self::EXPORTS_DIRECTORY);

        $writer = new Xlsx($this->spreadsheet);
        $writer->save($filePath);

        $this->cleanup();

        Log::debug('Excel file saved:', ['filePath' => $filePath]);

        return $filePath;
    }

    private function cleanup(): void
    {
        $this->spreadsheet->disconnectWorksheets();
        unset($this->spreadsheet);
    }

    private function getLastColumnIndex(): string
    {

        return Coordinate::stringFromColumnIndex(5 + (self::MONTH_COUNT * 2) + 4);
    }

    private function getColumnLetter(int $columnIndex): string
    {
        return Coordinate::stringFromColumnIndex($columnIndex);
    }


    /**
     * Get the generated file name.
     *
     * @return string
     */
    public function getFileName(): string
    {
        return $this->fileName;
    }

    /**
     * Get the relative file path for the export.
     *
     * @return string
     */
    public function getFilePath(): string
    {
        return sprintf('%s/%s', self::EXPORTS_DIRECTORY, $this->fileName);
    }
}
