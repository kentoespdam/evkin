<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class RoleInputs extends Model
{
    use HasFactory, HasSqids;

    protected $table = 'role_inputs';

    protected $fillable = ['role_id', 'master_input_id'];

    protected $hidden = ['created_at', 'updated_at'];

    protected string $sqidPrefix = 'ri';

    public function role()
    {
        return $this->belongsTo(Roles::class);
    }

    public function masterInput()
    {
        return $this->belongsTo(MasterInputs::class);
    }
}
