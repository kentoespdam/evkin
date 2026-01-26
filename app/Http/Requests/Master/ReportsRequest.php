<?php

namespace App\Http\Requests\Master;

use App\Models\Master\Aspects;
use App\Models\Master\ReportTypes;
use Illuminate\Foundation\Http\FormRequest;

class ReportsRequest extends FormRequest
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

        if ($this->has('aspect_id') && ! is_numeric($this->aspect_id)) {
            $aspect = Aspects::whereSqid($this->aspect_id)->first();
            if ($aspect) {
                $this->merge(['aspect_id' => $aspect->id]);
            }
        }

        if ($this->has('with_rules')) {
            $withRules = filter_var($this->with_rules, FILTER_VALIDATE_BOOLEAN);
            $this->merge(['with_rules' => $withRules]);
            if (! $withRules) {
                $this->merge(['rules' => '']);
            }
        }
    }

    public function rules(): array
    {
        return [
            'urut' => ['nullable', 'string'],
            'report_type_id' => ['required', 'exists:report_types,id'],
            'aspect_id' => ['required', 'exists:aspects,id'],
            'desc_indicator' => ['required', 'string'],
            'desc_formula' => ['required', 'string'],
            'unit' => ['required', 'string', 'max:50'],
            'weight' => ['required', 'numeric', 'min:0'],
            'formula' => ['required', 'string'],
            'formula_indicator' => ['required', 'string'],
            'with_rules' => ['required', 'boolean'],
            'rules' => ['required_if:with_rules,true', 'nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'urut.string' => 'Order must be a string',
            'report_type_id.required' => 'Report type is required',
            'report_type_id.exists' => 'Report type is invalid',
            'aspect_id.required' => 'Aspect is required',
            'aspect_id.exists' => 'Aspect is invalid',
            'desc_indicator.required' => 'Description indicator is required',
            'desc_formula.required' => 'Description formula is required',
            'unit.required' => 'Unit is required',
            'unit.max' => 'Unit may not be greater than 50 characters',
            'weight.required' => 'Weight is required',
            'weight.numeric' => 'Weight must be a number',
            'weight.min' => 'Weight must be at least 0',
            'formula.required' => 'Formula is required',
            'formula_indicator.required' => 'Formula indicator is required',
            'with_rules.required' => 'With rules field is required',
            'with_rules.boolean' => 'With rules must be true or false',
            'rules.required_if' => 'Rules is required when with rules is enabled',
        ];
    }
}
