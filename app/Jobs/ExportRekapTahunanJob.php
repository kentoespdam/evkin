<?php

namespace App\Jobs;

use App\Services\ExportRekapTahunanService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;

class ExportRekapTahunanJob implements ShouldQueue
{
    use Queueable, Dispatchable;

    private int $fromYear;
    private int $toYear;

    /**
     * Create a new job instance.
     */
    public function __construct(int $fromYear, int $toYear)
    {
        $this->fromYear = $fromYear;
        $this->toYear = $toYear;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $exportService = new ExportRekapTahunanService($this->fromYear, $this->toYear);
        $exportService->generateAndStore();
    }
}
