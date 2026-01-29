<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MasterInputsResource extends JsonResource
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
            'seq' => $this->seq,
            'aspect' => $this->aspect ? new AspectsResource($this->aspect) : null,
            'kode' => $this->kode,
            'description' => $this->description,
            'satuan' => $this->satuan,
            'masterSource' => $this->masterSource ? new MasterSourcesResource($this->masterSource) : null,
            'formula' => $this->formula,
        ];
    }
}
