<?php

namespace App\Jobs;

use App\Services\ExportReportPerhitunganDetailService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ExportReportDetailJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    private int $userId;

    private string $exportId;

    private int $year;

    private int $month;

    private string $report_type_id;

    private ?string $aspect_id;

    private ?string $search;

    /**
     * Create a new job instance.
     */
    public function __construct(
        int $userId,
        string $exportId,
        int $year,
        int $month,
        string $report_type_id,
        ?string $aspect_id = null,
        ?string $search = null
    ) {
        $this->userId = $userId;
        $this->exportId = $exportId;
        $this->year = $year;
        $this->month = $month;
        $this->report_type_id = $report_type_id;
        $this->aspect_id = $aspect_id;
        $this->search = $search;
    }

    /**
     * Execute the job.
     */
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
            $exportService = new ExportReportPerhitunganDetailService(
                $this->year,
                $this->month,
                $this->report_type_id,
                $this->aspect_id,
                $this->search
            );
            $exportService->generateAndStore();

            $filePath = storage_path("app/public/{$exportService->getFileName()}");

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
