<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReportTypesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $reportTypeId = $this->route('reportType')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('report_types', 'name')->ignore($reportTypeId),
            ],
            'template_name' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama harus diisi',
            'name.string' => 'Nama harus string',
            'name.max' => 'Nama maksimal 255 karakter',
            'name.unique' => 'Nama sudah digunakan',
            'template_name.required' => 'Template harus diisi',
            'template_name.string' => 'Template harus string',
            'template_name.max' => 'Template maksimal 255 karakter',
        ];
    }
}
