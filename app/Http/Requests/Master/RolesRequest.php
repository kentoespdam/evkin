<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RolesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('role')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($roleId),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama peran harus diisi',
            'name.string' => 'Nama peran harus string',
            'name.max' => 'Nama peran maksimal 255 karakter',
            'name.unique' => 'Nama peran sudah digunakan',
        ];
    }
}
