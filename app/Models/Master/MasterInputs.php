<?php

namespace App\Models\Master;

use App\Models\Transaksi\RekapInputTahunans;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class MasterInputs extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'master_inputs';

    protected $fillable = ['seq', 'aspect_id', 'kode', 'description', 'satuan', 'master_source_id', 'formula'];

    protected $hidden = ['created_at', 'updated_at'];

    protected string $sqidPrefix = 'in';

    public function masterSource()
    {
        return $this->belongsTo(MasterSources::class);
    }

    public function aspect()
    {
        return $this->belongsTo(Aspects::class);
    }

    public function rekapInputTahunans()
    {
        return $this->hasMany(RekapInputTahunans::class);
    }
}
