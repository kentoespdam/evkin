<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SourcesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sourceId = $this->route('source')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('master_sources', 'name')->ignore($sourceId),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Source name is required',
            'name.string' => 'Source name must be a string',
            'name.max' => 'Source name must not exceed 255 characters',
            'name.unique' => 'Source name has already been taken',
        ];
    }
}
