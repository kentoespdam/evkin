<?php

namespace App\Models\Transaksi;

use App\Models\Master\MasterInputs;
use App\Models\Master\MasterSources;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class RekapInputTahunans extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'rekap_input_tahunans';

    protected string $sqidPrefix = 'rit';

    protected $fillable = [
        'seq',
        'kode',
        'description',
        'satuan',
        'master_source_id',
        'master_input_id',
        'year',
        'nilai',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function masterSource()
    {
        return $this->belongsTo(MasterSources::class);
    }

    public function masterInput()
    {
        return $this->belongsTo(MasterInputs::class);
    }
}
