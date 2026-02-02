<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RekapInputTahunansResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->sqid,
            'seq' => $this->seq,
            'kode' => $this->kode,
            'description' => $this->description,
            'satuan' => $this->satuan,
            'masterSource' => new MasterSourcesResource($this->masterSource),
            'masterInput' => $this->masterInput ? new MasterInputsResource($this->masterInput) : null,
            'year' => $this->year,
            'nilai' => $this->nilai,
        ];
    }
}
