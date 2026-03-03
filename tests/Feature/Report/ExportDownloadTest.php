<?php

namespace Tests\Feature\Report;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class ExportDownloadTest extends TestCase
{
    public function test_report_export_download_uses_public_storage_path(): void
    {
        $this->withoutMiddleware();
        $exportId = (string) Str::uuid();
        $fileName = 'report-export-test.xlsx';
        $filePath = $this->createExportFile($fileName);

        Cache::put("export.{$exportId}", [
            'status' => 'completed',
            'file_path' => $fileName,
        ], 3600);

        $response = $this->get("/report/perhitungan-reports/export/{$exportId}/download");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        @unlink($filePath);
    }

    public function test_rekap_export_download_uses_public_storage_path(): void
    {
        $this->withoutMiddleware();
        $exportId = (string) Str::uuid();
        $fileName = 'rekap-export-test.xlsx';
        $filePath = $this->createExportFile($fileName);

        Cache::put("export.{$exportId}", [
            'status' => 'completed',
            'file_path' => $fileName,
        ], 3600);

        $response = $this->get("/rekap/export/{$exportId}/download");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        @unlink($filePath);
    }

    private function createExportFile(string $fileName): string
    {
        $directory = storage_path('app/public');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $filePath = $directory.DIRECTORY_SEPARATOR.$fileName;
        file_put_contents($filePath, 'test');

        return $filePath;
    }
}
