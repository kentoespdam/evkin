<?php

namespace App\Jobs;

use App\Services\ExportRekapTahunanService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ExportRekapTahunanJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    private int $fromYear;

    private int $toYear;

    private string $exportId;

    private int $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $fromYear, int $toYear, string $exportId, int $userId)
    {
        $this->fromYear = $fromYear;
        $this->toYear = $toYear;
        $this->exportId = $exportId;
        $this->userId = $userId;
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
            $exportService = new ExportRekapTahunanService($this->fromYear, $this->toYear);
            $exportService->generateAndStore();

            // Update status to completed
            Cache::put("export.{$this->exportId}", [
                'status' => 'completed',
                'progress' => 100,
                'file_path' => $exportService->getFilePath(),
                'file_size' => filesize($exportService->getFilePath()),
                'updated_at' => now(),
            ], 3600);

            Log::info('Export job completed', [
                'export_id' => $this->exportId,
                'user_id' => $this->userId,
                'file_size' => filesize($exportService->getFilePath()),
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
