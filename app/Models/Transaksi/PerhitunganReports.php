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
        'formula_archivement',
        'formula_archivement_value',
        'nilai_archivement',
        'nilai_indicator',
    ];

    protected $hidden = ['created_at'];

    public function masterReport()
    {
        return $this->belongsTo(MasterReports::class);
    }
}
