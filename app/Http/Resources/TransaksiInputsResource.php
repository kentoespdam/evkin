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
            'seq' => $this->masterInput?->seq,
            'kode' => $this->masterInput?->kode,
            'description' => $this->masterInput?->description,
            'satuan' => $this->masterInput?->satuan,
            'masterSource' => $this->masterInput?->masterSource ? new MasterSourcesResource($this->masterInput->masterSource) : null,
            'masterInput' => $this->masterInput ? new MasterInputsResource($this->masterInput) : null,
            'periode' => $this->periode,
            'year' => $this->year,
            'month' => $this->month,
            'nilai' => $this->nilai,
            'isLocked' => (bool) $this->is_locked,
        ];
    }
}
