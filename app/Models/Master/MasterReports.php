<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class MasterReports extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'master_reports';

    protected $fillable = ['report_type_id', 'descIndicator', 'descFormula', 'unit', 'weight', 'formula'];

    protected $hidden = ['created_at', 'updated_at'];

    protected string $sqidPrefix = 'mr';

    public function reportType()
    {
        return $this->belongsTo(ReportTypes::class);
    }
}
