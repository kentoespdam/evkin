<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerhitunganReportsResource extends JsonResource
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
            'masterReport' => new MasterReportsResource($this->masterReport),
            'year' => $this->year,
            'month' => $this->month,
            'descIndicator' => $this->desc_indicator,
            'formula' => $this->formula,
            'formulaValue' => $this->formula_value,
            'nilai' => $this->nilai,
        ];
    }
}
