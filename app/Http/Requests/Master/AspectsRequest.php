<?php

namespace App\Http\Requests\Master;

use App\Models\Master\ReportTypes;
use Illuminate\Foundation\Http\FormRequest;

class AspectsRequest extends FormRequest
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
        if ($this->has('report_type_id') && !is_numeric($this->report_type_id)) {
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
            'name' => ['required', 'string', 'max:255', 'unique:report_types,name'],
            'report_type_id' => ['required', 'numeric', 'exists:report_types,id'],
        ];
    }
}
