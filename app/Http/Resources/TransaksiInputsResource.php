<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransaksiInputsResource extends JsonResource
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
            'year' => $this->year,
            'month' => $this->month,
            'masterInput' => new MasterInputsResource($this->masterInput),
            'nilai' => $this->nilai,
        ];
    }
}
