<?php

namespace App\Http\Requests\Transaksi;

use Illuminate\Foundation\Http\FormRequest;

class LockTransaksiInputsRequest extends FormRequest
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
        if ($this->has('year')) {
            $this->merge(['year' => (int) $this->input('year')]);
        }

        if ($this->has('month')) {
            $this->merge(['month' => (int) $this->input('month')]);
        }

        if ($this->has('is_locked')) {
            $this->merge(['is_locked' => filter_var($this->input('is_locked'), FILTER_VALIDATE_BOOLEAN)]);
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
            'year' => ['sometimes', 'integer'],
            'month' => ['sometimes', 'integer', 'between:1,12'],
            'is_locked' => ['sometimes', 'boolean'],
        ];
    }
}
