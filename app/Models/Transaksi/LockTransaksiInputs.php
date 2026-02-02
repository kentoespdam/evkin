<?php

namespace App\Models\Transaksi;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use RedExplosion\Sqids\Concerns\HasSqids;

class LockTransaksiInputs extends Model
{
    /** @use HasFactory<\Database\Factories\Transaksi\LockTransaksiInputsFactory> */
    use HasFactory, HasSqids;

    protected $table = 'table_lock_transaksi_inputs';

    protected string $sqidPrefix = 'lti';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'year',
        'month',
        'is_locked',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = ['created_at', 'updated_at'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_locked' => 'boolean',
            'year' => 'integer',
            'month' => 'integer',
        ];
    }
}
