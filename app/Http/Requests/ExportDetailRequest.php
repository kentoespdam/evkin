<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExportDetailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'year' => ['required', 'integer', 'min:2000', 'max:'.date('Y')],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'report_type_id' => ['nullable', 'string'],
            'aspect_id' => ['nullable', 'string'],
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }
}
