<?php

namespace App\Http\Requests\Master\RoleInputs;

use App\Models\Master\MasterInputs;
use App\Models\Master\Roles;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleInputRequest extends FormRequest
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
        $this->convertSqidsToIds(['role_id']);
        $this->convertArraySqidsToIds('master_input_ids');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'role_id' => ['required', 'exists:roles,id'],
            'master_input_ids' => ['required', 'array', 'min:1'],
            'master_input_ids.*' => ['exists:master_inputs,id'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role_id.required' => 'Please select a role.',
            'role_id.exists' => 'The selected role is invalid.',
            'master_input_ids.required' => 'Please select at least one input.',
            'master_input_ids.array' => 'Invalid input format.',
            'master_input_ids.min' => 'Please select at least one input.',
            'master_input_ids.*.exists' => 'One or more selected inputs are invalid.',
        ];
    }

    /**
     * Convert sqid to id if provided.
     */
    private function convertSqidsToIds(array $fields): void
    {
        foreach ($fields as $field) {
            if ($this->has($field) && ! is_numeric($this->{$field})) {
                $source = $this->getModelByField($field)->whereSqid($this->{$field})->first();
                $this->merge([
                    $field => $source?->id,
                ]);
            }
        }
    }

    /**
     * Get model by field name.
     */
    private function getModelByField(string $field): \Illuminate\Database\Eloquent\Model
    {
        switch ($field) {
            case 'role_id':
                return new Roles;
            case 'master_input_id':
                return new MasterInputs;
            default:
                throw new \InvalidArgumentException(sprintf('Model not found for field "%s".', $field));
        }
    }

    /**
     * Convert array of sqids to ids if provided.
     */
    private function convertArraySqidsToIds(string $field): void
    {
        if ($this->has($field) && is_array($this->{$field})) {
            $convertedIds = [];
            foreach ($this->{$field} as $value) {
                if (! is_numeric($value)) {
                    $model = (new MasterInputs)->whereSqid($value)->first();
                    $convertedIds[] = $model?->id;
                } else {
                    $convertedIds[] = $value;
                }
            }
            $this->merge([
                $field => array_filter($convertedIds), // Remove null values
            ]);
        }
    }
}
