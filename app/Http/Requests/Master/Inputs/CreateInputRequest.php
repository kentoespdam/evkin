<?php

namespace App\Http\Requests\Master\Inputs;

use App\Models\Master\MasterInputs;
use App\Models\Master\MasterSources;
use Illuminate\Foundation\Http\FormRequest;

class CreateInputRequest extends FormRequest
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
        if (MasterInputs::where('kode', $this->input('kode'))->exists() === false) {
            $this->merge(['kode' => $this->input('kode')]);
        }

        if ($this->has('master_source_id') && ! is_numeric($this->master_source_id)) {
            $masterSourceId = MasterSources::whereSqid($this->master_source_id)->first();
            if ($masterSourceId) {
                $this->merge(['master_source_id' => $masterSourceId->id]);
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
            'kode' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
            'master_source_id' => ['required', 'integer', 'exists:master_sources,id'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'master_source_id' => 'Source',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'kode.required' => 'The code field is required.',
            'kode.max' => 'The code may not be greater than 255 characters.',
            'description.required' => 'The description field is required.',
            'description.max' => 'The description may not be greater than 255 characters.',
            'master_source_id.required' => 'Please select a source.',
            'master_source_id.exists' => 'The selected source is invalid.',
        ];
    }
}
