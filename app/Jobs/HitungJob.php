<?php

namespace App\Jobs;

use App\Helpers\FormulaHelper;
use App\Helpers\FormulaIndicatorHelper;
use App\Helpers\HitungInputTahunanHelper;
use App\Helpers\HitungPerhitunganReportsHelper;
use App\Models\Master\MasterReports;
use App\Models\Transaksi\PerhitunganReports;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HitungJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    private int $year;

    private int $month;

    /**
     * Create a new job instance.
     */
    public function __construct(int $year, int $month)
    {
        $this->year = $year;
        $this->month = $month;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // First, calculate yearly input totals - must complete before reports
        HitungInputTahunanHelper::calculate($this->year);

        // Then, calculate report metrics using the yearly data
        HitungPerhitunganReportsHelper::calculate($this->year, $this->month);
    }
}
