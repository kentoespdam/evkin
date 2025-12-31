<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class ReportTypes extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'report_types';

    protected $fillable = ['name'];

    protected $hidden = ['created_at', 'updated_at'];

    protected string $sqidPrefix = 'rt';
}
