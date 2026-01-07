<?php

namespace App\Http\Requests\Transaksi;

use App\Models\Master\MasterInputs;
use App\Models\Transaksi\TransaksiInputs;
use Illuminate\Foundation\Http\FormRequest;

class TransaksiInputsRequest extends FormRequest
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
        $this->convertArraySqidsToIds('master_input_ids');
        $this->merge(['year' => (int) $this->input('year')]);
        $this->merge(['month' => (int) $this->input('month')]);
        $this->merge([
            'nilais' => array_map(function ($value) {
                return (int) $value;
            }, $this->input('nilais', []))
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'year' => ['required', 'numeric'],
            'month' => ['required', 'numeric', 'between:1,12'],
            'master_input_ids' => ['required', 'array'],
            'master_input_ids.*' => ['exists:master_inputs,id'],
            'nilais' => ['array'],
        ];
    }

    private function getModelByField(string $field): \Illuminate\Database\Eloquent\Model
    {
        switch ($field) {
            case 'ids':
                return new TransaksiInputs;
            case 'master_input_ids':
                return new MasterInputs;
            default:
                throw new \InvalidArgumentException(sprintf('Error Model not found for field "%s".', $field));
        }
    }

    private function convertArraySqidsToIds(string $field)
    {
        if ($this->has($field) && is_array($this->{$field})) {
            $convertedIds = array_map(function ($value) use ($field) {
                if (!is_numeric($value) && !empty($value)) {
                    $model = $this->getModelByField($field);
                    $model = $model->whereSqid($value)->first();
                    return $model?->id;
                } else {
                    return (int) $value;
                }
            }, $this->{$field});
            $this->merge([
                $field => $convertedIds, // Remove null values
            ]);
        }
    }


}