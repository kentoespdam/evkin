<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleInputsWithTransaksiInputsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->sqid,
            'role' => new RolesResource($this->role),
            'masterInput' => new MasterInputsResource($this->masterInput),
            'transaksiInputs' => new TransaksiInputsResource($this->transaksiInputs[0] ?? null),
        ];
    }
}
