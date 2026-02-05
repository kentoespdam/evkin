<?php

namespace App\Jobs;

use App\Services\PerhitunganReportExportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProcessExportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $exportId;

    protected array $filters;

    protected int $userId;

    protected string $exportType;

    public function __construct(string $exportId, array $filters, int $userId, string $exportType = 'detail')
    {
        $this->exportId = $exportId;
        $this->filters = $filters;
        $this->userId = $userId;
        $this->exportType = $exportType;
    }

    public function handle(PerhitunganReportExportService $exportService): void
    {
        try {
            // Update status to processing
            Cache::put("export.{$this->exportId}", [
                'status' => 'processing',
                'progress' => 10,
                'updated_at' => now(),
            ], 3600);

            // Generate file path
            $fileName = "exports/{$this->exportId}.xlsx";
            $filePath = storage_path("app/{$fileName}");

            // Ensure exports directory exists
            if (! file_exists(storage_path('app/exports'))) {
                mkdir(storage_path('app/exports'), 0755, true);
            }

            // Generate and save the file based on export type
            if ($this->exportType === 'index') {
                $exportService->generateAndStoreIndex($this->filters, $filePath);
            } else {
                $exportService->generateAndStore($this->filters, $filePath);
            }

            // Update status to completed
            Cache::put("export.{$this->exportId}", [
                'status' => 'completed',
                'progress' => 100,
                'file_path' => $fileName,
                'file_size' => filesize($filePath),
                'updated_at' => now(),
            ], 3600);

            Log::info('Export job completed', [
                'export_id' => $this->exportId,
                'user_id' => $this->userId,
                'export_type' => $this->exportType,
                'file_size' => filesize($filePath),
            ]);

        } catch (\Exception $e) {
            Cache::put("export.{$this->exportId}", [
                'status' => 'failed',
                'error' => $e->getMessage(),
                'updated_at' => now(),
            ], 3600);

            Log::error('Export job failed', [
                'export_id' => $this->exportId,
                'export_type' => $this->exportType,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
