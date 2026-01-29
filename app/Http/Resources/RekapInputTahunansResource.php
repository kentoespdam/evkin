<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RekapInputTahunansResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->sqids,
            'seq' => $this->seq,
            'kode' => $this->kode,
            'description' => $this->description,
            'satuan' => $this->satuan,
            'masterSource' => new MasterSourcesResource($this->masterSource),
            'year' => $this->year,
            'nilai' => $this->nilai,
        ];
    }
}
