<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MasterReportsResource extends JsonResource
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
            'report_type_id' => $this->reportType->sqid,
            'descIndicator' => $this->descIndicator,
            'descFormula' => $this->descFormula,
            'unit' => $this->unit,
            'weight' => $this->weight,
            'formula' => $this->formula,
        ];
    }
}
