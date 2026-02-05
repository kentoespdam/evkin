<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

trait ExcelProgressTracker
{
    protected array $exportStats = [];

    protected string $progressCacheKey;

    protected function initializeProgressTracking(array $filters, ?string $identifier = null): void
    {
        $this->progressCacheKey = 'export_progress_'.($identifier ?? md5(serialize($filters)));

        $this->exportStats = [
            'started_at' => now(),
            'total_records' => 0,
            'processed_records' => 0,
            'current_sheet' => 1,
            'total_sheets' => 1,
            'progress_percentage' => 0,
            'status' => 'initializing',
        ];

        $this->updateProgress();
    }

    protected function setTotalRecords(int $total): void
    {
        $this->exportStats['total_records'] = $total;
        $this->exportStats['status'] = 'processing';
        $this->updateProgress();
    }

    protected function updateExportProgress(int $processed, ?int $total = null): void
    {
        $this->exportStats['processed_records'] = $processed;

        if ($total !== null) {
            $this->exportStats['total_records'] = $total;
        }

        if ($this->exportStats['total_records'] > 0) {
            $this->exportStats['progress_percentage'] = round(
                ($processed / $this->exportStats['total_records']) * 100,
                2
            );
        }

        $this->updateProgress();

        // Log progress for large exports
        if ($this->exportStats['total_records'] > 5000 && $processed % 1000 === 0) {
            Log::info('Export Progress', [
                'processed' => $processed,
                'total' => $this->exportStats['total_records'],
                'percentage' => $this->exportStats['progress_percentage'],
                'current_sheet' => $this->exportStats['current_sheet'],
            ]);
        }
    }

    protected function setCurrentSheet(int $sheetNumber, ?int $totalSheets = null): void
    {
        $this->exportStats['current_sheet'] = $sheetNumber;

        if ($totalSheets !== null) {
            $this->exportStats['total_sheets'] = $totalSheets;
        }

        $this->updateProgress();
    }

    protected function markExportCompleted(): void
    {
        $this->exportStats['status'] = 'completed';
        $this->exportStats['completed_at'] = now();
        $this->exportStats['duration_seconds'] = now()->diffInSeconds($this->exportStats['started_at']);
        $this->exportStats['progress_percentage'] = 100;

        $this->updateProgress();

        Log::info('Excel Export Completed', [
            'stats' => $this->exportStats,
            'cache_key' => $this->progressCacheKey,
        ]);
    }

    protected function markExportFailed(string $error): void
    {
        $this->exportStats['status'] = 'failed';
        $this->exportStats['error'] = $error;
        $this->exportStats['failed_at'] = now();

        $this->updateProgress();

        Log::error('Excel Export Failed', [
            'stats' => $this->exportStats,
            'error' => $error,
        ]);
    }

    protected function updateProgress(): void
    {
        Cache::put($this->progressCacheKey, $this->exportStats, 3600);
    }

    public function getExportProgress(string $identifier): array
    {
        $cacheKey = 'export_progress_'.$identifier;

        return Cache::get($cacheKey, [
            'status' => 'not_found',
            'progress_percentage' => 0,
            'message' => 'Export not found or expired',
        ]);
    }

    public function clearExportProgress(string $identifier): void
    {
        $cacheKey = 'export_progress_'.$identifier;
        Cache::forget($cacheKey);
    }
}
