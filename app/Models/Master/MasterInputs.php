<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class MasterInputs extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'master_inputs';

    protected $fillable = ['kode', 'description', 'master_source_id'];

    protected $hidden = ['created_at', 'updated_at'];

    protected string $sqidPrefix = 'in';

    public function masterSource()
    {
        return $this->belongsTo(MasterSources::class);
    }
}
