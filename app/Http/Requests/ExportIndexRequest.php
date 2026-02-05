<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExportIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'year' => ['required', 'integer', 'min:2000', 'max:'.date('Y')],
            'report_type_id' => ['nullable', 'string'],
            'aspect_id' => ['nullable', 'string'],
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }
}
