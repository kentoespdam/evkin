<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class RekapInputTahunansCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return $this->collection->map(function ($rekap) {
            return new RekapInputTahunansResource($rekap);
        })->toArray();
    }

    public function paginationInformation($request, $paginated, $default): array
    {
        return [
            'links' => $default['links'],
            'meta' => $default['meta'],
        ];
    }
}
