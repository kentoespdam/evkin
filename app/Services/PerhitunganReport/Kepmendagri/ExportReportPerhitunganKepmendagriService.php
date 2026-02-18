<?php

namespace App\Services\PerhitunganReport\Kepmendagri;

use App\Services\PerhitunganReport\Kepmendagri\PerhitunganReportDataProvider;
use App\Services\PerhitunganReport\Kepmendagri\PerhitunganReportExcelBuilder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * Service to generate and export the "Perhitungan Kepmendagri" report as an Excel file.
 *
 * Coordinates data fetching, Excel building, and file storage.
 */
class ExportReportPerhitunganKepmendagriService
{
    private const EXPORTS_DIRECTORY = 'exports';

    private int $year;

    private string $reportTypeId;

    private ?string $search;

    private PerhitunganReportDataProvider $dataProvider;

    private PerhitunganReportExcelBuilder $excelBuilder;

    public string $fileName;

    public function __construct(int $year, string $report_type_id, ?string $search = null)
    {
        $this->year = $year;
        $this->reportTypeId = $report_type_id;
        $this->search = $search;

        $this->dataProvider = new PerhitunganReportDataProvider($year, $report_type_id, $search);
        $this->excelBuilder = new PerhitunganReportExcelBuilder(
            $year,
            $this->dataProvider->getReportType()->name,
            $this->dataProvider->getLastInputMonth()
        );

        $this->generateFileName();
    }

    /**
     * Generate the report and store the Excel file.
     *
     * @return string Full path to the saved file
     */
    public function generateAndStore(): string
    {
        $data = $this->dataProvider->getData();
        $spreadsheet = $this->excelBuilder->build($data);

        return $this->saveExcelFile($spreadsheet);
    }

    /**
     * Generate a unique file name for the export.
     */
    private function generateFileName(): void
    {
        $timestamp = now()->format('Ymd_His');
        $this->fileName = sprintf(
            'Report_Perhitungan_%s_%d_%s.xlsx',
            $this->dataProvider->getReportType()->name,
            $this->year,
            $timestamp
        );
    }

    /**
     * Save the spreadsheet to the exports directory.
     *
     * @return string Full file path
     */
    private function saveExcelFile(Spreadsheet $spreadsheet): string
    {
        $filePath = storage_path(sprintf('app/%s/%s', self::EXPORTS_DIRECTORY, $this->fileName));

        Storage::makeDirectory(self::EXPORTS_DIRECTORY);

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        Log::debug('Excel file saved', ['filePath' => $filePath]);

        return $filePath;
    }

    /**
     * Get the generated file name.
     */
    public function getFileName(): string
    {
        return $this->fileName;
    }

    /**
     * Get the relative file path for the export.
     */
    public function getFilePath(): string
    {
        return sprintf('%s/%s', self::EXPORTS_DIRECTORY, $this->fileName);
    }
}
