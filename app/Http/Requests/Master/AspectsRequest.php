<?php

namespace App\Http\Requests\Master;

use App\Models\Master\ReportTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AspectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('report_type_id') && ! is_numeric($this->report_type_id)) {
            $reportType = ReportTypes::whereSqid($this->report_type_id)->first();
            if ($reportType) {
                $this->merge(['report_type_id' => $reportType->id]);
            }
        }
    }

    public function rules(): array
    {
        $aspectId = $this->route('aspect')?->id;

        return [
            'report_type_id' => ['required', 'exists:report_types,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('aspects', 'name')
                    ->where('report_type_id', $this->report_type_id)
                    ->ignore($aspectId),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'report_type_id.required' => 'Report type is required',
            'report_type_id.exists' => 'Report type is invalid',
            'name.required' => 'Name is required',
            'name.string' => 'Name must be a string',
            'name.max' => 'Name must not exceed 255 characters',
            'name.unique' => 'Name has already been taken for this report type',
        ];
    }
}
