<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isTenantAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'description' => 'required|string',
            'description_ar' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'subcategory_id' => 'required|integer|exists:subcategories,id',

            'status' => 'nullable|in:active,draft,out-of-stock',
            'image_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
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
            'name.required' => 'Product name is required',
            'slug.required' => 'Product slug is required',
            'slug.unique' => 'This slug is already in use',
            'description.required' => 'Product description is required',
            'price.required' => 'Product price is required',
            'price.min' => 'Price must be at least 0',
            'stock_quantity.required' => 'Stock quantity is required',
            'stock_quantity.min' => 'Stock quantity must be at least 0',
            'subcategory_id.required' => 'Subcategory is required',
            'subcategory_id.exists' => 'Selected subcategory does not exist',
            'sku.required' => 'SKU is required',
            'sku.unique' => 'This SKU is already in use',
            'status.in' => 'Status must be active, draft, or out-of-stock',
            'image.image' => 'The file must be an image',
            'image.mimes' => 'Image must be a file of type: jpeg, png, jpg, gif',
            'image.max' => 'Image size must not exceed 10MB',
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
        // Debug: Log validation failures
        \Log::error('Product validation failed', [
            'errors' => $validator->errors()->toArray(),
            'input' => $this->all()
        ]);
        
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422));
    }
}
