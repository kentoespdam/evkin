<?php

namespace App\Jobs;

use App\Services\ExportRekapBulananService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;

class ExportRekapBulananJob implements ShouldQueue
{
    use Queueable, Dispatchable;

    private int $year;

    /**
     * Create a new job instance.
     */
    public function __construct(int $year)
    {
        $this->year = $year;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $exportService = new ExportRekapBulananService($this->year);
        $exportService->generateAndStore();
    }
}
