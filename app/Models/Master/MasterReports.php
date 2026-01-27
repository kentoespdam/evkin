<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class MasterReports extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'master_reports';

    protected $fillable = [
        'seq',
        'urut',
        'report_type_id',
        'aspect_id',
        'desc_indicator',
        'desc_formula',
        'unit',
        'weight',
        'formula',
        'formula_indicator',
        'formula_archivement',
        'with_rules',
        'rules',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    protected string $sqidPrefix = 'mr';

    protected function casts(): array
    {
        return [
            'with_rules' => 'boolean',
        ];
    }

    public function reportType()
    {
        return $this->belongsTo(ReportTypes::class);
    }

    public function aspects()
    {
        return $this->belongsTo(Aspects::class, 'aspect_id');
    }
}
