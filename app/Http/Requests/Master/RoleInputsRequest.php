<?php

namespace App\Http\Requests\Master;

use App\Models\Master\MasterInputs;
use App\Models\Master\Roles;
use Illuminate\Foundation\Http\FormRequest;

class RoleInputsRequest extends FormRequest
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

        if ($this->has('master_input_ids') && is_array($this->master_input_ids)) {
            $convertedIds = [];
            foreach ($this->master_input_ids as $value) {
                if (! is_numeric($value)) {
                    $input = MasterInputs::whereSqid($value)->first();
                    if ($input) {
                        $convertedIds[] = $input->id;
                    }
                } else {
                    $convertedIds[] = $value;
                }
            }
            $this->merge(['master_input_ids' => array_filter($convertedIds)]);
        }
    }

    public function rules(): array
    {
        return [
            'role_id' => ['required', 'exists:roles,id'],
            'master_input_ids' => ['required', 'array', 'min:1'],
            'master_input_ids.*' => ['exists:master_inputs,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'role_id.required' => 'Please select a role',
            'role_id.exists' => 'The selected role is invalid',
            'master_input_ids.required' => 'Please select at least one input',
            'master_input_ids.array' => 'Invalid input format',
            'master_input_ids.min' => 'Please select at least one input',
            'master_input_ids.*.exists' => 'One or more selected inputs are invalid',
        ];
    }
}
