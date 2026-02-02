<?php

namespace App\Models\Transaksi;

use App\Models\Master\MasterInputs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class TransaksiInputs extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'transaksi_inputs';

    protected string $sqidPrefix = 'ti';

    protected $fillable = [
        'periode',
        'year',
        'month',
        'master_input_id',
        'nilai',
        'is_locked',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function masterInput()
    {
        return $this->belongsTo(MasterInputs::class);
    }

    public function masterSource()
    {
        return $this->hasOneThrough(
            \App\Models\Master\MasterSources::class,
            MasterInputs::class,
            'id',
            'id',
            'master_input_id',
            'master_source_id'
        );
    }
}
