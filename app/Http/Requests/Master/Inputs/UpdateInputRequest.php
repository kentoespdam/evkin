<?php

namespace App\Http\Requests\Master\Inputs;

use App\Models\Master\MasterSources;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInputRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert sqid to id if provided
        if ($this->has('master_source_id') && ! is_numeric($this->master_source_id)) {
            $source = MasterSources::whereSqid($this->master_source_id)->first();
            $this->merge([
                'master_source_id' => $source?->id,
            ]);
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
            '' => ['required', 'string', ''],
        ];
    }
}
