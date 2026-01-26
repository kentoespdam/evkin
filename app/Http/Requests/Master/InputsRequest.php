<?php

namespace App\Http\Requests\Master;

use App\Models\Master\MasterSources;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InputsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $kode = $this->input('kode');
        if ($kode) {
            $this->merge(['kode' => str_replace(' ', '', $kode)]);
        }

        if ($this->has('master_source_id') && ! is_numeric($this->master_source_id)) {
            $masterSource = MasterSources::whereSqid($this->master_source_id)->first();
            if ($masterSource) {
                $this->merge(['master_source_id' => $masterSource->id]);
            }
        }
    }

    public function rules(): array
    {
        $inputId = $this->route('input')?->id;

        return [
            'kode' => [
                'required',
                'string',
                'max:255',
                Rule::unique('master_inputs', 'kode')->ignore($inputId),
            ],
            'description' => ['required', 'string', 'max:255'],
            'satuan' => ['required', 'string', 'max:255'],
            'master_source_id' => ['required', 'integer', 'exists:master_sources,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode.required' => 'The code field is required',
            'kode.unique' => 'The code has already been taken',
            'kode.max' => 'The code may not be greater than 255 characters',
            'description.required' => 'The description field is required',
            'description.max' => 'The description may not be greater than 255 characters',
            'satuan.required' => 'The unit field is required',
            'satuan.max' => 'The unit may not be greater than 255 characters',
            'master_source_id.required' => 'Please select a source',
            'master_source_id.exists' => 'The selected source is invalid',
        ];
    }
}
