<?php

namespace Tests\Feature\Service;

use App\Data\ExcelConfiguration;
use App\Helpers\CellHelper;
use App\Helpers\DateHelper;
use App\Models\Master\MasterInputs;
use App\Models\Transaksi\RekapInputTahunans;
use App\Models\Transaksi\TransaksiInputs;
use App\Services\Excel\ExcelStyleManager;
use App\Services\Excel\PositionTracker;
use App\Services\Excel\PositionTrackerBuilder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

use function PHPUnit\Framework\assertIsString;

class ExportRekapBulananServiceTest extends TestCase
{
    private const REKAP_RELATIONS = ['masterInput.masterSource', 'masterInput.aspect.reportType'];

    private string $sheetTitle = 'Rekap Bulanan';

    private int $year;

    private string $fileName;

    private Spreadsheet $spreadsheet;

    private ExcelConfiguration $excelConfig;

    private PositionTracker $positionTracker;

    public function test_example(): void
    {
        $this->positionTracker = (new PositionTrackerBuilder)
            ->startRow(1)
            // ->startOrder(1)
            ->build();
        $this->year = 2026;
        $this->generateFileName();
        assertIsString($this->fileName);

        // Log::debug('File Name:', ['fileName' => $this->fileName]);

        $this->generateExcelFile();
    }

    private function generateFileName()
    {
        $timestamp = now()->format('YmdHis');
        $this->fileName = "rekap-bulanan-{$this->year}-{$timestamp}.xlsx";
    }

    private function collectData()
    {
        $masterInputs = MasterInputs::where('aspect_id', '!=', null)
            ->orderBy('aspect_id')
            ->orderBy('seq')
            ->get()
            ->values();
        $aspectsGrouped = $masterInputs->groupBy('aspect_id')->map(function ($items) {
            $firstItem = $items->first();

            return [
                'aspect_id' => $firstItem->aspect_id,
                'aspect_name' => $firstItem->aspect->name,
                'report_type_id' => $firstItem->aspect->report_type_id,
            ];
        })->values()->keyBy('report_type_id');

        $reportTypesGrouped = $masterInputs->groupBy('aspect.report_type_id')->map(function ($items) {
            $firstItem = $items->first();

            return [
                'report_type_id' => $firstItem->aspect->report_type_id,
                'report_type_name' => $firstItem->aspect->reportType->name,
            ];
        })->values()->keyBy('report_type_id');

        [$masterIds, $aspects, $reportTypes] = $this->extractAspectsAndReportTypes($masterInputs);

        Log::debug('Collected Master Inputs:', [
            'count' => $masterInputs->count(),
            // 'aspects' => json_encode($aspectsGrouped),
            'reportTypes' => json_encode($reportTypesGrouped),
        ]);
        $rekapData = TransaksiInputs::with(self::REKAP_RELATIONS)
            ->whereIn('master_input_id', $masterIds)
            ->where('year', $this->year)
            ->get()
            ->sortBy(fn ($item) => $item->masterInput->seq)
            ->values();

        $rekapTahunan = RekapInputTahunans::with(self::REKAP_RELATIONS)
            ->whereIn('master_input_id', $masterIds)
            ->where('year', $this->year - 1)
            ->orderBy('seq')
            ->get()
            ->values();

        return [$masterInputs, $aspects, $reportTypes, $rekapData, $rekapTahunan];
    }

    private function extractAspectsAndReportTypes(Collection $collection): array
    {
        $masterIds = $collection->pluck('id')->unique()->values();
        $aspects = [];
        foreach ($collection->pluck('aspect')->whereNotNull()->unique() as $aspect) {
            $aspects[$aspect->id] = $aspect;
        }
        $aspects = collect($aspects)->unique();

        $reportTypes = [];
        foreach ($aspects->pluck('reportType')->whereNotNull()->unique() as $reportType) {
            $reportTypes[$reportType->id] = $reportType;
        }
        $reportTypes = collect($reportTypes)->unique();

        return [
            $masterIds,
            $aspects->values(),
            $reportTypes->values(),
        ];
    }

    private function processData()
    {
        [$masterInputs, $aspects, $reportTypes, $rekapData, $rekapTahunan] = $this->collectData();
        $aspectDataMap = [];
        foreach ($aspects as $aspect) {
            $reportTypeId = $aspect->report_type_id;
            $aspectList = $aspectDataMap[$reportTypeId] ?? [];
            $aspectList[] = $aspect;
            $aspectDataMap[$reportTypeId] = $aspectList;
        }

        $masterInputMap = [];
        foreach ($masterInputs as $masterInput) {
            $aspectId = $masterInput->aspect_id;
            if ($aspectId) {
                $inputs = $masterInputMap[$aspectId] ?? [];
                $inputs[] = $masterInput;
                $masterInputMap[$aspectId] = $inputs;
            }
        }

        $rekapDataMap = [];
        foreach ($rekapData as $rekap) {
            if ($rekap->master_input_id && $rekap->year && $rekap->month) {
                $key = "{$rekap->master_input_id}-{$rekap->year}-{$rekap->month}";
                $rekapDataMap[$key] = $rekap->nilai;
            }
        }

        foreach ($rekapTahunan as $rekapTahun) {
            if ($rekapTahun->master_input_id && $rekapTahun->year) {
                $key = "{$rekapTahun->master_input_id}-{$rekapTahun->year}-12";
                $rekapDataMap[$key] = (float) $rekapTahun->nilai;
            }
        }

        return [
            'aspectDataMap' => $aspectDataMap,
            'masterInputMap' => $masterInputMap,
            'rekapDataMap' => $rekapDataMap,
            'reportTypes' => $reportTypes,
        ];
    }

    private function generateReportTypeHeaderRow(Worksheet $sheet, array $reportType, int $mergeLength)
    {
        if (empty($reportType)) {
            return;
        }
        $currentRow = $this->positionTracker->nextRow();
        $column = Coordinate::stringFromColumnIndex(1);
        $mergeTo = Coordinate::stringFromColumnIndex($mergeLength);
        ExcelStyleManager::addCell(
            $sheet,
            "{$column}{$currentRow}",
            $reportType['name'],
            [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_LEFT,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]
        );
        $sheet->mergeCells("{$column}{$currentRow}:{$mergeTo}{$currentRow}");
    }

    private function generateHeaderTableRow(Worksheet $sheet)
    {
        ExcelStyleManager::applyHeaderStyle(
            $sheet,
            $this->excelConfig->headers,
            $this->excelConfig,
            $this->positionTracker->nextRow(),
        );
    }

    private function generateMonthValue(Worksheet $sheet, int $currentRow, int $masterId, array $rekapData)
    {
        for ($month = 1; $month <= 12; $month++) {
            $key = "{$masterId}-{$this->year}-{$month}";
            $value = $rekapData[$key] ?? '';
            $column = Coordinate::stringFromColumnIndex(4 + $month);
            ExcelStyleManager::addCell(
                $sheet,
                "{$column}{$currentRow}",
                $value,
                ExcelStyleManager::ALL_BORDER_STYLE
            );
        }
        // Rata-Rata / Pencapaian
        $prevYear = $this->year - 1;
        $avgKey = "{$masterId}-{$prevYear}-12";
        $avgValue = $rekapData[$avgKey] ?? '';
        $avgColumn = Coordinate::stringFromColumnIndex(17);
        ExcelStyleManager::addCell(
            $sheet,
            "{$avgColumn}{$currentRow}",
            $avgValue,
            ExcelStyleManager::ALL_BORDER_STYLE
        );
    }

    private function generateDataRow(Worksheet $sheet, array $masterInputs, array $rekapData)
    {
        if (empty($masterInputs)) {
            return;
        }

        foreach ($masterInputs as $masterInput) {
            $currentRow = $this->positionTracker->nextRow();
            // Seq
            ExcelStyleManager::addCell(
                $sheet,
                'A'.$currentRow,
                $masterInput->seq,
                array_merge([
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_RIGHT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ], ExcelStyleManager::ALL_BORDER_STYLE)
            );

            // Indikator
            ExcelStyleManager::addCell(
                $sheet,
                'B'.$currentRow,
                $masterInput->description,
                ExcelStyleManager::ALL_BORDER_STYLE
            );

            // Sumber Data
            $sourceName = $masterInput->masterSource ? $masterInput->masterSource->name : '';
            ExcelStyleManager::addCell(
                $sheet,
                'C'.$currentRow,
                $sourceName,
                ExcelStyleManager::ALL_BORDER_STYLE
            );

            // Satuan
            ExcelStyleManager::addCell(
                $sheet,
                'D'.$currentRow,
                $masterInput->satuan,
                array_merge([
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ], ExcelStyleManager::ALL_BORDER_STYLE)
            );

            $masterId = $masterInput->id;
            $this->generateMonthValue($sheet, $currentRow, $masterId, $rekapData);
        }
    }

    private function generateAspectRow(
        Worksheet $sheet,
        array $aspectMap,
        int $mergeLength,
        array $masterInputMap,
        array $rekapDataMap
    ) {
        if (empty($aspectMap)) {
            return;
        }
        foreach ($aspectMap as $aspect) {
            $currentRow = $this->positionTracker->nextRow();
            $mergeTo = Coordinate::stringFromColumnIndex($mergeLength);
            $sheet->mergeCells("A{$currentRow}:{$mergeTo}{$currentRow}");
            $cell = $sheet->getCell("A{$currentRow}");
            $cell->setValue($aspect->name);
            $sheet->getStyle("A{$currentRow}:{$mergeTo}{$currentRow}")
                ->applyFromArray(array_merge(
                    [
                        'font' => [
                            'bold' => true,
                            'size' => 11,
                        ],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'color' => ['rgb' => 'D9E1F2'],
                        ],
                    ],
                    ExcelStyleManager::ALIGN_LEFT_CENTER_STYLE,
                    ExcelStyleManager::ALL_BORDER_STYLE
                ));
            $masterInputs = $masterInputMap[$aspect->id] ?? [];
            $this->generateDataRow(
                $sheet,
                $masterInputs,
                $rekapDataMap
            );
        }
    }

    private function addDataRow(Worksheet $sheet, array $rowData)
    {
        $mergeLength = count($this->excelConfig->headers);
        foreach ($rowData['reportTypes']->toArray() as $reportType) {
            $this->generateReportTypeHeaderRow($sheet, $reportType, $mergeLength);
            $this->generateHeaderTableRow($sheet);
            $reportTypeId = $reportType['id'];
            $aspects = $rowData['aspectDataMap'][$reportTypeId] ?? [];
            $masterInputMap = $rowData['masterInputMap'];
            $rekapDataMap = $rowData['rekapDataMap'];
            $this->generateAspectRow(
                $sheet,
                $aspects,
                $mergeLength,
                $masterInputMap,
                $rekapDataMap
            );
            $this->positionTracker = $this->positionTracker->advanceRows(1); // Add an empty row after each report type
        }
    }

    private function generateConfig(Worksheet $sheet)
    {
        $this->excelConfig = ExcelConfiguration::create()
            ->withHeaders($this->generateHeaderRow())
            ->withSheetTitle($this->sheetTitle.' Tahun '.$this->year)
            ->withNumberColumns(array_fill(5, 17, '0.00'))
            ->withRightAlignColumns(array_merge([0], range(4, 17)))
            ->withZebraStriping(true);
    }

    private function generateExcelFile(): void
    {
        // Log::debug('Generating Excel file:', ['fileName' => $this->fileName]);

        $this->spreadsheet = new Spreadsheet;
        $sheet = $this->spreadsheet->getActiveSheet();
        $sheet->setTitle("{$this->sheetTitle} {$this->year}");

        $this->generateConfig($sheet);

        $this->setDocumentProperties();

        $this->addTitleRow($sheet);

        $this->positionTracker = $this->positionTracker->advanceRows(3); // Skip one row after title

        $data = $this->processData();
        // Log::debug('Processed data for Excel generation:', $data);
        $this->addDataRow($sheet, $data);

        ExcelStyleManager::applySheetConfiguration($sheet, $this->excelConfig);

        $this->saveExcelFile();

    }

    private function generateHeaderRow()
    {
        $mainHeader = [
            new CellHelper('#'),
            new CellHelper(value: 'Indikator', width: 50),
            new CellHelper(value: 'Sumber Data', width: 20),
            new CellHelper(value: 'Satuan', width: 15),
        ];
        $months = array_map(
            fn ($month) => new CellHelper(value: $month, width: 20),
            DateHelper::$monthList
        );

        return array_merge($mainHeader, $months, [new CellHelper(value: 'Rata-Rata / Pencapaian', width: 25)]);
    }

    private function setDocumentProperties()
    {
        $defaultProperties = [
            'creator' => 'Developer Perumdam Tirta Satria',
            'lastModifiedBy' => 'Developer Perumdam Tirta Satria',
            'title' => $this->sheetTitle,
            'subject' => 'Export from Perumdam Tirta Satria',
            'description' => 'Generated on '.now()->format('Y-m-d H:i:s'),
        ];

        foreach ($defaultProperties as $property => $value) {
            match ($property) {
                'creator' => $this->spreadsheet->getProperties()->setCreator($value),
                'lastModifiedBy' => $this->spreadsheet->getProperties()->setLastModifiedBy($value),
                'title' => $this->spreadsheet->getProperties()->setTitle($value),
                'subject' => $this->spreadsheet->getProperties()->setSubject($value),
                'description' => $this->spreadsheet->getProperties()->setDescription($value),
                default => null,
            };
        }
    }

    protected function addTitleRow(Worksheet $sheet)
    {
        ExcelStyleManager::addCell(
            $sheet,
            'A1',
            "{$this->sheetTitle} - Tahun {$this->year}",
            [
                'font' => [
                    'bold' => true,
                    'size' => 16,
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]
        );
        $mergeTo = Coordinate::stringFromColumnIndex(count($this->excelConfig->headers));
        $sheet->mergeCells("A1:{$mergeTo}1");
    }

    private function saveExcelFile()
    {
        $writer = new Xlsx($this->spreadsheet);
        $filePath = storage_path("app/exports/{$this->fileName}");
        $writer->save($filePath);
        $this->spreadsheet->disconnectWorksheets();
        unset($this->spreadsheet);

        // Log::debug('Excel file saved:', ['filePath' => $filePath]);
    }
}
