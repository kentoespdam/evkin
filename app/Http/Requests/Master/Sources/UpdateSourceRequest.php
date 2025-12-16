<?php

namespace App\Http\Requests\Master\Sources;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSourceRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', 'unique:master_sources,name,'.$this->id],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama sumber harus diisi',
            'name.string' => 'Nama sumber harus string',
            'name.max' => 'Nama sumber maksimal 255 karakter',
        ];
    }
}
