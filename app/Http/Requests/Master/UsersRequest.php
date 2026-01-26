<?php

namespace App\Http\Requests\Master;

use App\Models\Master\Roles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('role_id') && ! is_numeric($this->role_id)) {
            $role = Roles::whereSqid($this->role_id)->first();
            if ($role) {
                $this->merge(['role_id' => $role->id]);
            }
        }
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'password' => [
                $userId ? 'nullable' : 'required',
                'string',
                'confirmed',
                Password::min(8),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama harus diisi',
            'name.max' => 'Nama maksimal 255 karakter',
            'email.required' => 'Email harus diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah digunakan',
            'role_id.required' => 'Please select a role',
            'role_id.exists' => 'The selected role is invalid',
            'password.required' => 'Password harus diisi',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
        ];
    }
}
