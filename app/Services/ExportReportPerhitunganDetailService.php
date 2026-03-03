<?php

namespace App\Services;

use App\Data\ExcelConfiguration;
use App\Helpers\CellHelper;
use App\Helpers\DateHelper;
use App\Models\Master\Aspects;
use App\Models\Master\ReportTypes;
use App\Models\Transaksi\PerhitunganReports;
use App\Services\Excel\ExcelStyleManager;
use App\Services\Excel\PositionTracker;
use App\Services\Excel\PositionTrackerBuilder;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportReportPerhitunganDetailService
{
    private const EXPORTS_DIRECTORY = 'public';

    private const TITLE_ROW_HEIGHT = 2;

    private int $year;

    private int $month;

    private string $report_type_id;

    private ?string $aspect_id;

    private ?string $search;

    private ?ReportTypes $reportType = null;

    private ?Aspects $aspect = null;

    public string $fileName;

    private Spreadsheet $spreadsheet;

    private ExcelConfiguration $excelConfig;

    private PositionTracker $positionTracker;

    private array $headerCells = [];

    public function __construct(
        int $year,
        int $month,
        string $report_type_id,
        ?string $aspect_id,
        ?string $search
    ) {
        $this->year = $year;
        $this->month = $month;
        $this->report_type_id = $report_type_id;
        $this->aspect_id = $aspect_id;
        $this->search = $search;

        $this->initializeService();
    }

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

    public function generateAndStore(): string
    {
        Log::debug('Starting Excel generation process.');
        $this->initializeSpreadsheet();
        $this->addTitleRow();
        $this->addTableHeaders();
        $this->addDataRows();

        return $this->saveExcelFile();
    }

    private function initializeSpreadsheet(): void
    {
        $this->spreadsheet = new Spreadsheet;
        $this->setDocumentProperties();
    }

    private function setDocumentProperties(): void
    {
        $properties = $this->spreadsheet->getProperties();
        $timestamp = now()->format('Y-m-d H:i:s');

        $properties->setCreator('Developer Perumdam Tirta Satria');
        $properties->setLastModifiedBy('Developer Perumdam Tirta Satria');
        $properties->setTitle($this->excelConfig->sheetTitle);
        $properties->setSubject('Export from Perumdam Tirta Satria');
        $properties->setDescription("Generated on {$timestamp}");
    }

    private function addTitleRow(): void
    {
        $sheet = $this->spreadsheet->getActiveSheet();
        $reportType = $this->reportType;
        $month = $this->month;
        $title = sprintf(
            'Rekap Perhitungan Detail (%s) - %s %d',
            $reportType ? $reportType->name : 'Semua Tipe Laporan',
            DateHelper::getMonthName($month),
            $this->year
        );

        $styles = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::FONT_BOLD_16_STYLE,
            ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE
        );

        ExcelStyleManager::addCell(
            $sheet,
            'A1',
            $title,
            $styles
        );

        $lastColumn = $this->getLastColumnIndex();
        $sheet->mergeCells("A1:{$lastColumn}1");

        $this->positionTracker = $this->positionTracker->advanceRows(self::TITLE_ROW_HEIGHT);
    }

    private function addTableHeaders(): void
    {
        $sheet = $this->spreadsheet->getActiveSheet();
        ExcelStyleManager::applyHeaderStyle(
            $sheet,
            $this->excelConfig->headers,
            $this->excelConfig,
            $this->positionTracker->nextRow()
        );
    }

    private function addDataRows(): void
    {
        $data = $this->prepareData();
        $sheet = $this->spreadsheet->getActiveSheet();
        foreach ($data as $item) {
            $this->appendDataRow($sheet, $item);
        }
    }

    private function appendDataRow($sheet, $item): void
    {
        $currentRow = $this->positionTracker->nextRow();
        $formula = $item->formula;
        if ($item->masterReport->withRules && $item->masterReport->rules) {
            $formula .= ' ('.$item->masterReport->rules.')';
        }
        $rowCells = [
            'A' => ['value' => $item->masterReport->urut, 'align' => 'right'],
            'B' => ['value' => sprintf('%04d-%02d', $item->year, $item->month), 'align' => 'center'],
            'C' => ['value' => $item->desc_indicator],
            'D' => ['value' => $formula],
            'E' => ['value' => $item->formulaValue],
            'F' => ['value' => $item->masterReport->unit, 'align' => 'center'],
            'G' => ['value' => $item->nilai, 'align' => 'right'],
            'H' => ['value' => $item->nilai_indicator, 'align' => 'right'],
            'I' => ['value' => $item->formula_nilai_bobot],
            'J' => ['value' => $item->nilai_bobot, 'align' => 'right'],
            'K' => ['value' => $item->formula_archivement, 'align' => 'left'],
            'L' => ['value' => $item->formula_archivement_value, 'align' => 'left'],
            'M' => ['value' => $item->nilai_archivement, 'align' => 'right'],
        ];

        foreach ($rowCells as $column => $data) {
            $style = ExcelStyleManager::ALL_BORDER_STYLE;
            if (isset($data['align'])) {
                switch ($data['align']) {
                    case 'center':
                        $alignStyle = ExcelStyleManager::ALIGN_CENTER_CENTER_STYLE;
                        break;
                    case 'right':
                        $alignStyle = ExcelStyleManager::ALIGN_RIGHT_CENTER_STYLE;
                        break;
                    default:
                        $alignStyle = ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE;
                        break;
                }
                $style = ExcelStyleManager::mergeStyles($style, $alignStyle);
            }

            ExcelStyleManager::addCell(
                $sheet,
                "{$column}{$currentRow}",
                $data['value'],
                $style
            );
        }

    }

    private function prepareData()
    {
        $data = PerhitunganReports::with('masterReport')
            ->forPeriod($this->year, $this->month)
            ->forReportType($this->reportType?->id)
            ->forAspect($this->aspect?->id)
            ->searchIndicator($this->search)
            ->orderedByMasterReport()
            ->get();

        return $data;
    }

    private function prepareBaseData(): void
    {
        $this->reportType = ReportTypes::whereSqid($this->report_type_id)->first();

        if ($this->aspect_id) {
            $this->aspect = Aspects::whereSqid($this->aspect_id)->first();
        }
    }

    private function generateFileName(): void
    {
        $year = $this->year;
        $month = $this->month;
        $reportType = $this->reportType;
        $aspect = $this->aspect;

        $timestamp = time();
        $baseFileName = 'perhitungan_detail_';

        if ($reportType) {
            $baseFileName .= $reportType->name.'_';
        }
        if ($aspect) {
            $baseFileName .= $aspect->name.'_';
        }
        $baseFileName .= sprintf(
            '%d_%d_%d',
            $year,
            $month,
            $timestamp
        );
        $this->fileName = sprintf('%s.xlsx', $baseFileName);
    }

    private function generateHeaders()
    {
        $this->headerCells = [
            new CellHelper('#'),
            new CellHelper(value: 'Periode', width: 20),
            new CellHelper(value: 'Indikator', width: 50),
            new CellHelper(value: 'Rumus', width: 50),
            new CellHelper(value: 'Rumus Value', width: 50),
            new CellHelper(value: 'Satuan', width: 15),
            new CellHelper(value: 'Nilai', width: 15),
            new CellHelper(value: 'Nilai Indikator', width: 15),
            new CellHelper(value: 'Rumus Bobot', width: 30),
            new CellHelper(value: 'Nilai Bobot', width: 15),
            new CellHelper(value: 'Rumus Pencapaian', width: 50),
            new CellHelper(value: 'Rumus Pencapaian Value', width: 50),
            new CellHelper(value: 'Nilai Pencapaian', width: 20),
        ];
    }

    private function createExcelConfiguration(): void
    {
        $this->excelConfig = ExcelConfiguration::create()
            ->withHeaders($this->headerCells)
            ->withSheetTitle('Report Perhitungan Detail')
            ->withZebraStriping(true);
    }

    private function saveExcelFile(): string
    {
        $filePath = storage_path(sprintf('app/%s/%s', self::EXPORTS_DIRECTORY, $this->fileName));

        // Ensure directory exists

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
        $columnIndex = count($this->excelConfig->headers);

        return Coordinate::stringFromColumnIndex($columnIndex);
    }

    public function getFileName(): string
    {
        return $this->fileName;
    }

    public function getFilePath(): string
    {

        return sprintf('app/%s/%s', self::EXPORTS_DIRECTORY, $this->fileName);

    }
}
