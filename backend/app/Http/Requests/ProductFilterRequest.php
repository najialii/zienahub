<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ProductFilterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Temporarily allow all authenticated users for testing
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:categories,id',
            'subcategory_id' => 'nullable|integer|exists:subcategories,id',
            'status' => 'nullable|in:active,draft,out-of-stock',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0|gte:min_price',
            'stock_status' => 'nullable|in:in-stock,low-stock,out-of-stock',
            'sort_by' => 'nullable|in:name,price,stock_quantity,created_at,updated_at',
            'sort_order' => 'nullable|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.exists' => 'Selected category does not exist',
            'subcategory_id.exists' => 'Selected subcategory does not exist',
            'status.in' => 'Status must be active, draft, or out-of-stock',
            'min_price.min' => 'Minimum price must be at least 0',
            'max_price.min' => 'Maximum price must be at least 0',
            'max_price.gte' => 'Maximum price must be greater than or equal to minimum price',
            'stock_status.in' => 'Stock status must be in-stock, low-stock, or out-of-stock',
            'sort_by.in' => 'Invalid sort field',
            'sort_order.in' => 'Sort order must be asc or desc',
            'per_page.max' => 'Cannot display more than 100 items per page',
            'per_page.min' => 'Must display at least 1 item per page',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Invalid filter parameters',
            'errors' => $validator->errors()
        ], 422));
    }
}
