<?php

namespace App\Services;

use App\Data\ExcelConfiguration;
use App\Helpers\CellHelper;
use App\Helpers\DateHelper;
use App\Models\Master\MasterInputs;
use App\Models\Transaksi\RekapInputTahunans;
use App\Models\Transaksi\TransaksiInputs;
use App\Services\Excel\ExcelStyleManager;
use App\Services\Excel\PositionTracker;
use App\Services\Excel\PositionTrackerBuilder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportRekapBulananService
{
    private const REKAP_RELATIONS = ['masterInput.masterSource', 'masterInput.aspect.reportType'];

    public const EXPORTS_DIRECTORY = 'exports';

    private const TITLE_ROW_HEIGHT = 2;

    private const MONTH_COUNT = 12;

    private const RATA_RATA_COLUMN_INDEX = 17;

    private const HEADER_ROW_HEIGHT = 1;

    private int $year;

    public string $fileName;

    private Spreadsheet $spreadsheet;

    private ExcelConfiguration $excelConfig;

    private PositionTracker $positionTracker;

    private array $headerCells = [];

    public function __construct(int $year)
    {
        $this->year = $year;
        $this->initializeService();
    }

    private function initializeService(): void
    {
        $this->positionTracker = (new PositionTrackerBuilder)
            ->startRow(1)
            ->build();
        $this->generateFileName();
        $this->generateHeaders();
        $this->createExcelConfiguration();
    }

    public function generateAndStore(): string
    {
        $this->initializeSpreadsheet();
        $this->addTitleRow();
        $this->addDataRows();

        return $this->saveExcelFile();
    }

    private function initializeSpreadsheet(): void
    {
        $this->spreadsheet = new Spreadsheet;
        $this->setDocumentProperties();

        $sheet = $this->spreadsheet->getActiveSheet();
        $sheet->setTitle($this->excelConfig->sheetTitle);
    }

    private function generateFileName(): void
    {
        $timestamp = now()->format('YmdHis');
        $this->fileName = sprintf('rekap-bulanan-%d-%s.xlsx', $this->year, $timestamp);
    }

    private function generateHeaders(): void
    {
        $mainHeaders = [
            new CellHelper('#'),
            new CellHelper(value: 'Indikator', width: 50),
            new CellHelper(value: 'Sumber Data', width: 20),
            new CellHelper(value: 'Satuan', width: 15),
        ];

        $monthHeaders = array_map(
            fn ($month) => new CellHelper(value: $month, width: 20),
            DateHelper::$monthList
        );

        $rataRataHeader = new CellHelper(value: 'Rata-Rata / Pencapaian', width: 25);

        $this->headerCells = [...$mainHeaders, ...$monthHeaders, $rataRataHeader];
    }

    private function createExcelConfiguration(): void
    {
        $this->excelConfig = ExcelConfiguration::create()
            ->withHeaders($this->headerCells)
            ->withSheetTitle(sprintf('Rekap Bulanan Tahun %d', $this->year))
            ->withNumberColumns(array_fill(4, self::MONTH_COUNT + 1, '0.00'))
            ->withRightAlignColumns([0, ...range(4, 4 + self::MONTH_COUNT)])
            ->withZebraStriping(true);
    }

    private function setDocumentProperties(): void
    {
        $properties = $this->spreadsheet->getProperties();
        $timestamp = now()->format('Y-m-d H:i:s');

        $properties->setCreator('Developer Perumdam Tirta Satria');
        $properties->setLastModifiedBy('Developer Perumdam Tirta Satria');
        $properties->setTitle('Rekap Bulanan');
        $properties->setSubject('Export from Perumdam Tirta Satria');
        $properties->setDescription("Generated on {$timestamp}");
    }

    private function addTitleRow(): void
    {
        $sheet = $this->spreadsheet->getActiveSheet();
        $title = sprintf('Rekap Bulanan - Tahun %d', $this->year);

        ExcelStyleManager::addCell($sheet, 'A1', $title, [
            'font' => ['bold' => true, 'size' => 16],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $lastColumn = $this->getLastColumnIndex();
        $sheet->mergeCells("A1:{$lastColumn}1");

        $this->positionTracker = $this->positionTracker->advanceRows(self::TITLE_ROW_HEIGHT);
    }

    private function addDataRows(): void
    {
        $data = $this->prepareData();
        $this->generateReportTypeSections($data);
    }

    private function prepareData(): array
    {
        // Prepare Data: ambil master inputs dan organzie sesuai spec
        $masterInputs = MasterInputs::with('aspect.reportType')
            ->with('masterSource')
            ->whereNotNull('aspect_id')
            ->orderBy('aspect_id')
            ->orderBy('seq')
            ->get();

        $masterInputIds = $masterInputs->pluck('id')->unique()->toArray();

        // Ambil data rekap bulanan
        $rekapDataBulanan = $this->getRekapData($masterInputIds);

        // Ambil data rekap tahunan
        $rekapDataTahunan = $this->getRekapTahunanData($masterInputIds);

        // Join data rekap bulanan dan tahunan
        $rekapData = array_merge($rekapDataBulanan, $rekapDataTahunan);

        return $this->organizeData($masterInputs, $rekapData);
    }

    private function getRekapData($masterInputIds): array
    {
        return TransaksiInputs::with(self::REKAP_RELATIONS)
            ->whereIn('master_input_id', $masterInputIds)
            ->where('year', $this->year)
            ->get()
            ->keyBy(fn ($item) => sprintf(
                '%d-%d-%d',
                $item->master_input_id,
                $item->year,
                $item->month
            ))
            ->map(fn ($item) => (float) $item->nilai)
            ->toArray();
    }

    private function getRekapTahunanData($masterInputIds): array
    {
        return RekapInputTahunans::with(self::REKAP_RELATIONS)
            ->whereIn('master_input_id', $masterInputIds)
            ->where('year', $this->year - 1)
            ->get()
            ->keyBy(fn ($item) => sprintf(
                '%d-%d',
                $item->master_input_id,
                $item->year
            ))
            ->map(fn ($item) => (float) $item->nilai)
            ->toArray();
    }

    private function organizeData($masterInputs, array $rekapData): array
    {
        // Process Data: ambil unique reportTypes
        $reportTypesGrouped = $masterInputs
            ->groupBy(fn ($item) => $item->aspect?->reportType?->id)
            ->filter(fn ($items) => $items->first()->aspect?->reportType !== null)
            ->map(function ($items) {
                $firstItem = $items->first();

                return [
                    'report_type_id' => $firstItem->aspect->reportType->id,
                    'report_type_name' => $firstItem->aspect->reportType->name,
                ];
            })
            ->keyBy('report_type_id');

        // Ambil unique aspect dari master inputs, map dengan reportType
        $aspectsGrouped = $masterInputs
            ->groupBy('aspect_id')
            ->filter(fn ($items) => $items->first()->aspect !== null)
            ->map(function ($items) {
                $firstItem = $items->first();

                return [
                    'aspect_id' => $firstItem->aspect_id,
                    'aspect_name' => $firstItem->aspect->name,
                    'report_type_id' => $firstItem->aspect->reportType?->id,
                ];
            })
            ->keyBy('aspect_id');

        // Group aspects by report type
        $aspectsByReportType = $aspectsGrouped
            ->groupBy('report_type_id')
            ->toArray();

        // Group master inputs by aspect
        $masterInputsByAspect = $masterInputs
            ->groupBy('aspect_id')
            ->toArray();

        return [
            'reportTypes' => $reportTypesGrouped->values()->toArray(),
            'aspectsByReportType' => $aspectsByReportType,
            'masterInputsByAspect' => $masterInputsByAspect,
            'rekapData' => $rekapData,
        ];
    }

    private function generateReportTypeSections(array $data): void
    {
        $sheet = $this->spreadsheet->getActiveSheet();

        foreach ($data['reportTypes'] as $reportType) {
            $reportTypeId = $reportType['report_type_id'];

            $this->addReportTypeHeader($sheet, $reportType['report_type_name']);
            $this->addTableHeaders($sheet);

            // Ambil aspects untuk report type ini
            $aspects = $data['aspectsByReportType'][$reportTypeId] ?? [];

            $this->generateAspectRows(
                $sheet,
                $aspects,
                $data['masterInputsByAspect'],
                $data['rekapData']
            );

            $this->positionTracker = $this->positionTracker->advanceRows(self::HEADER_ROW_HEIGHT);
        }

    }

    private function addReportTypeHeader($sheet, string $reportTypeName): void
    {
        $currentRow = $this->positionTracker->nextRow();
        $lastColumn = $this->getLastColumnIndex();

        ExcelStyleManager::addCell(
            $sheet,
            "A{$currentRow}",
            $reportTypeName,
            ExcelStyleManager::mergeStyles(
                ExcelStyleManager::$FONT_BOLD_12_STYLE,
                ExcelStyleManager::$ALIGN_LEFT_CENTER_STYLE
            )
        );

        $sheet->mergeCells("A{$currentRow}:{$lastColumn}{$currentRow}");
    }

    private function addTableHeaders($sheet): void
    {
        ExcelStyleManager::applyHeaderStyle(
            $sheet,
            $this->excelConfig->headers,
            $this->excelConfig,
            $this->positionTracker->nextRow()
        );
    }

    private function generateAspectRows($sheet, array $aspects, array $masterInputMap, array $rekapData): void
    {
        foreach ($aspects as $aspect) {
            $aspectId = $aspect['aspect_id'];
            $aspectName = $aspect['aspect_name'];

            $this->addAspectHeader($sheet, $aspectName);

            $masterInputs = $masterInputMap[$aspectId] ?? [];
            $this->addMasterInputRows($sheet, $masterInputs, $rekapData);
        }
    }

    private function addAspectHeader($sheet, string $aspectName): void
    {
        $currentRow = $this->positionTracker->nextRow();
        $lastColumn = $this->getLastColumnIndex();

        $sheet->mergeCells("A{$currentRow}:{$lastColumn}{$currentRow}");
        $sheet->getCell("A{$currentRow}")->setValue($aspectName);

        $style = ExcelStyleManager::mergeStyles(
            ExcelStyleManager::$FONT_BOLD_12_STYLE,
            ExcelStyleManager::$FILL_SOLID_GRAY_STYLE,
            ExcelStyleManager::$ALIGN_LEFT_CENTER_STYLE,
            ExcelStyleManager::$ALL_BORDER_STYLE
        );

        $sheet->getStyle("A{$currentRow}:{$lastColumn}{$currentRow}")->applyFromArray($style);
    }

    private function addMasterInputRows($sheet, array $masterInputs, array $rekapData): void
    {
        foreach ($masterInputs as $masterInput) {
            $this->addMasterInputRow($sheet, $masterInput, $rekapData);
        }
    }

    private function addMasterInputRow($sheet, $masterInput, array $rekapData): void
    {
        $currentRow = $this->positionTracker->nextRow();

        // Add basic information columns
        $this->addBasicInfoCells($sheet, $currentRow, $masterInput);

        // Add monthly values
        $this->addMonthlyValues($sheet, $currentRow, $masterInput['id'], $rekapData);

        // Add average/yearly value column
        $this->addAverageValue($sheet, $currentRow, $masterInput['id'], $rekapData);
    }

    private function addBasicInfoCells($sheet, int $row, $masterInput): void
    {
        $cells = [
            'A' => ['value' => $masterInput['seq'], 'alignment' => 'right'],
            'B' => ['value' => $masterInput['description']],
            'C' => ['value' => optional($masterInput['master_source'])['name'] ?? ''],
            'D' => ['value' => $masterInput['satuan'], 'alignment' => 'center'],
        ];

        foreach ($cells as $column => $data) {
            $style = ExcelStyleManager::$ALL_BORDER_STYLE;

            if (isset($data['alignment'])) {
                $style['alignment'] = [
                    'horizontal' => $data['alignment'] === 'right'
                        ? Alignment::HORIZONTAL_RIGHT
                        : Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ];
            }

            ExcelStyleManager::addCell($sheet, "{$column}{$row}", $data['value'], $style);
        }
    }

    private function addMonthlyValues($sheet, int $row, int $masterId, array $rekapData): void
    {
        for ($month = 1; $month <= self::MONTH_COUNT; $month++) {
            $key = sprintf('%d-%d-%d', $masterId, $this->year, $month);
            $value = $rekapData[$key] ?? '';
            $column = $this->getColumnLetter(4 + $month);

            $style = array_merge(
                ExcelStyleManager::$ALL_BORDER_STYLE,
                array_merge(
                    ExcelStyleManager::$ALIGN_RIGHT_CENTER_STYLE,
                    ExcelStyleManager::$FORMAT_NUMBER_00_STYLE,
                )
            );

            ExcelStyleManager::addCell(
                $sheet,
                "{$column}{$row}",
                $value,
                $style
            );
        }
    }

    private function addAverageValue($sheet, int $row, int $masterId, array $rekapData): void
    {
        // Cari nilai tahunan (year sebelumnya)
        $key = sprintf('%d-%d', $masterId, $this->year - 1);
        $value = $rekapData[$key] ?? '';
        $column = $this->getColumnLetter(self::RATA_RATA_COLUMN_INDEX);

        $style = array_merge(
            ExcelStyleManager::$ALL_BORDER_STYLE,
            array_merge(
                ExcelStyleManager::$ALIGN_RIGHT_CENTER_STYLE,
                ExcelStyleManager::$FORMAT_NUMBER_00_STYLE,
            )
        );

        ExcelStyleManager::addCell(
            $sheet,
            "{$column}{$row}",
            $value,
            $style
        );
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
        $columnIndex = count($this->excelConfig->headers);

        return Coordinate::stringFromColumnIndex($columnIndex);
    }

    private function getColumnLetter(int $columnIndex): string
    {
        return Coordinate::stringFromColumnIndex($columnIndex);
    }

    public function getFileName(): string
    {
        return $this->fileName;
    }

    public function getFilePath(): string
    {
        $filePath = sprintf('app/%s/%s', self::EXPORTS_DIRECTORY, $this->fileName);

        return storage_path($filePath);
    }
}
