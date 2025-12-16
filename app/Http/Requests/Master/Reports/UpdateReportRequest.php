<?php

namespace App\Http\Requests\Master\Reports;

use App\Models\Master\ReportTypes;
use Illuminate\Foundation\Http\FormRequest;

class UpdateReportRequest extends FormRequest
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
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'urut' => ['numeric', 'min:0', 'max:255'],
            'report_type_id' => ['required', 'exists:report_types,id'],
            'descIndicator' => ['required', 'string'],
            'descFormula' => ['required', 'string'],
            'unit' => ['required', 'string'],
            'weight' => ['required', 'numeric'],
            'formula' => ['required', 'string'],
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
            'weight.required' => 'Weight is required',
            'formula.required' => 'Formula is required',
        ];
    }
}
