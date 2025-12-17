<?php

namespace App\Http\Requests\Master\Roles;

use Illuminate\Foundation\Http\FormRequest;

class CreateRoleRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama peran harus diisi',
            'name.string' => 'Nama peran harus string',
            'name.max' => 'Nama peran maksimal 255 karakter',
        ];
    }
}
