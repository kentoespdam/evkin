<?php

namespace App\Http\Requests\Master;

use App\Models\Master\Aspects;
use App\Models\Master\ReportTypes;
use Illuminate\Foundation\Http\FormRequest;

class ReportsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('report_type_id') && ! is_numeric($this->report_type_id)) {
            $reportTypeId = ReportTypes::whereSqid($this->report_type_id)->first();
            if ($reportTypeId) {
                $this->merge(['report_type_id' => $reportTypeId->id]);
            }
        }

        if ($this->has('aspect_id') && ! is_numeric($this->aspect_id)) {
            $aspectId = Aspects::whereSqid($this->aspect_id)->first();
            if ($aspectId) {
                $this->merge(['aspect_id' => $aspectId->id]);
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

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'urut' => ['string'],
            'report_type_id' => ['required', 'exists:report_types,id'],
            'aspect_id' => ['required', 'exists:aspects,id'],
            'desc_indicator' => ['required', 'string'],
            'desc_formula' => ['required', 'string'],
            'unit' => ['required', 'string'],
            'weight' => ['required', 'numeric'],
            'formula' => ['required', 'string'],
            'with_rules' => ['required', 'boolean'],
            'rules' => ['required_if:with_rules,true', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'urut.numeric' => 'Urut must be a number',
            'report_type_id.required' => 'Report type is required',
            'report_type_id.exists' => 'Report type is invalid',
            'descIndicator.required' => 'Description indicator is required',
            'descFormula.required' => 'Description formula is required',
            'unit.required' => 'Unit is required',
            'formula.required' => 'Formula is required',
            'weight.required' => 'Weight is required',
            'with_rules.required' => 'With rules is required',
            'rules.required_if' => 'Rules is required when with rules is true',
        ];
    }
}
