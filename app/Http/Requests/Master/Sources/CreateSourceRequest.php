<?php

namespace App\Http\Requests\Master\Sources;

use Illuminate\Foundation\Http\FormRequest;

class CreateSourceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:master_sources,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Source name is required',
            'name.string' => 'Source name must be a string',
            'name.max' => 'Source name must be less than 255 characters',
        ];
    }
}
