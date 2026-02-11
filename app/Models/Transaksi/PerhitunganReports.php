<?php

namespace App\Models\Transaksi;

use App\Models\Master\MasterReports;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class PerhitunganReports extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'perhitungan_reports';

    protected string $sqidPrefix = 'pr';

    protected $fillable = [
        'master_report_id',
        'year',
        'month',
        'desc_indicator',
        'formula',
        'formula_value',
        'nilai',
        'nilai_indicator',
        'formula_nilai_bobot',
        'nilai_bobot',
        'formula_archivement',
        'formula_archivement_value',
        'nilai_archivement',
        'nilai_archivement_indicator',
    ];

    protected $hidden = ['created_at'];

    public function masterReport()
    {
        return $this->belongsTo(MasterReports::class);
    }

    public function scopeForPeriod($query, int $year, int $month)
    {
        return $query->where('year', $year)->where('month', $month);
    }

    public function scopeForReportType($query, ?int $reportTypeId)
    {
        if (! $reportTypeId) {
            return $query;
        }

        return $query->whereHas('masterReport', fn ($q) => $q->where('report_type_id', $reportTypeId));
    }

    public function scopeForAspect($query, ?int $aspectId)
    {
        if (! $aspectId) {
            return $query;
        }

        return $query->whereHas('masterReport', fn ($q) => $q->where('aspect_id', $aspectId));
    }

    public function scopeSearchIndicator($query, ?string $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where('desc_indicator', 'like', "%{$search}%");
    }

    public function scopeOrderedByMasterReport($query)
    {
        return $query
            ->join('master_reports', 'master_reports.id', '=', 'perhitungan_reports.master_report_id')
            ->select('perhitungan_reports.*')
            ->orderBy('master_reports.aspect_id')
            ->orderBy('master_reports.seq');
    }

    public static function getPerhitunganReports(int $year, ?int $reportTypeId, ?string $search, bool $includeLastDecember = false): \Illuminate\Database\Eloquent\Collection
    {
        $query = self::with('masterReport')
            ->where('year', $year)
            ->whereHas('masterReport', fn ($q) => $q->where('report_type_id', $reportTypeId));

        if ($includeLastDecember) {
            $query->orWhere(function ($q) use ($year, $reportTypeId) {
                $q->where('year', $year - 1)
                    ->where('month', 12)
                    ->whereHas('masterReport', fn ($inner) => $inner->where('report_type_id', $reportTypeId));
            });
        }

        return $query->when(
            $search,
            fn ($q) => $q->whereHas(
                'masterReport',
                fn ($inner) => $inner->where('desc_indicator', 'like', "%{$search}%")
            )
        )
            ->get();
    }
}
