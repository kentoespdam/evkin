<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class Roles extends Model
{
    /** @use HasFactory<\Database\Factories\Master\RolesFactory> */
    use HasFactory, HasSqids;

    /**
     * The Sqid prefix for the Roles model.
     */
    protected string $sqidPrefix = 'rol';

    protected $table = 'roles';

    protected $fillable = ['name'];

    protected $hidden = ['created_at', 'updated_at'];
}
