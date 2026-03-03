<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PurgeExportFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exports:purge {--days= : Delete export files older than N days}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Purge old export files from storage';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) ($this->option('days') ?? config('exports.retention_days', 7));

        if ($days < 1) {
            $this->error('Days must be 1 or greater.');

            return self::FAILURE;
        }

        $diskName = (string) config('exports.disk', 'public');
        $extensions = (array) config('exports.extensions', ['xlsx']);
        $normalizedExtensions = array_map('strtolower', $extensions);
        $threshold = now()->subDays($days)->getTimestamp();

        $disk = Storage::disk($diskName);
        $deleted = 0;

        foreach ($disk->allFiles() as $path) {
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

            if (! in_array($extension, $normalizedExtensions, true)) {
                continue;
            }

            if ($disk->lastModified($path) <= $threshold) {
                $disk->delete($path);
                $deleted++;
            }
        }

        $this->info("Deleted {$deleted} export file(s) older than {$days} day(s).");

        return self::SUCCESS;
    }
}
