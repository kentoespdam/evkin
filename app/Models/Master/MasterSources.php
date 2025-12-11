<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class MasterSources extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'master_sources';

    protected $fillable = ['name'];

    protected string $sqidPrefix = 'src';
}
