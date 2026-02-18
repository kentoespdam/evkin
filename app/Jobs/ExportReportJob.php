<?php

namespace App\Jobs;

use App\Services\ExportReportPerhitunganKepmendagriService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ExportReportJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    private int $userId;

    private string $exportId;

    private int $year;

    private string $report_type_id;

    private ?string $search;

    public function __construct(
        int $userId,
        string $exportId,
        int $year,
        string $report_type_id,
        ?string $search = null
    ) {
        $this->userId = $userId;
        $this->exportId = $exportId;
        $this->year = $year;
        $this->report_type_id = $report_type_id;
        $this->search = $search;
    }

    public function handle(): void
    {
        try {
            // Update status to processing
            Cache::put("export.{$this->exportId}", [
                'status' => 'processing',
                'progress' => 10,
                'updated_at' => now(),
            ], 3600);

            // Generate and save the file based on export type
            $exportService = new ExportReportPerhitunganKepmendagriService(
                $this->year,
                $this->report_type_id,
                $this->search
            );
            $exportService->generateAndStore();

            $filePath = storage_path("app/{$exportService->getFilePath()}");

            // Update status to completed
            Cache::put("export.{$this->exportId}", [
                'status' => 'completed',
                'progress' => 100,
                'file_path' => $exportService->getFileName(),
                'file_size' => filesize($filePath),
                'updated_at' => now(),
            ], 3600);

            Log::info('Export job completed', [
                'export_id' => $this->exportId,
                'user_id' => $this->userId,
                'file_size' => filesize($filePath),
                'file_path' => $filePath,
            ]);

        } catch (\Exception $e) {
            Cache::put("export.{$this->exportId}", [
                'status' => 'failed',
                'error' => $e->getMessage(),
                'updated_at' => now(),
            ], 3600);

            Log::error('Export job failed', [
                'export_id' => $this->exportId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
