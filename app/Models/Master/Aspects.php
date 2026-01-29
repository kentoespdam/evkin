<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class Aspects extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'aspects';

    protected $fillable = ['name', 'report_type_id', 'formula_aspect'];

    protected $hidden = ['created_at', 'updated_at'];

    protected string $sqidPrefix = 'as';

    public function reportTypes()
    {
        return $this->belongsTo(ReportTypes::class, 'report_type_id');
    }

    public function masterInputs()
    {
        return $this->hasMany(MasterInputs::class, 'aspect_id');
    }
}
