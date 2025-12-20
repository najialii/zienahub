<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryTranslation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    /**
     * Get all categories for admin
     */
    public function index(Request $request)
    {
        try {
            $query = Category::with('translations');

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->whereHas('translations', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            }

            // Order by created_at (most recent first)
            $query->orderBy('created_at', 'desc');

            $categories = $query->get()->map(function($category) {
                // Try to get products count
                $productsCount = 0;
                try {
                    $productsCount = $category->products()->count();
                } catch (\Exception $e) {
                    // Relationship might not exist
                }

                return [
                    'id' => $category->id,
                    'name' => $category->getName('en'),
                    'name_ar' => $category->getName('ar'),
                    'slug' => $category->slug,
                    'description' => $category->getDescription('en'),
                    'description_ar' => $category->getDescription('ar'),
                    'image_url' => $category->image_url,
                    'products_count' => $productsCount,
                    'created_at' => $category->created_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch categories', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single category
     */
    public function show($id)
    {
        try {
            $category = Category::with('translations')->findOrFail($id);
            
            // Try to get products count
            $productsCount = 0;
            try {
                $productsCount = $category->products()->count();
            } catch (\Exception $e) {
                // Relationship might not exist
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $category->id,
                    'name' => $category->getName('en'),
                    'name_ar' => $category->getName('ar'),
                    'slug' => $category->slug,
                    'description' => $category->getDescription('en'),
                    'description_ar' => $category->getDescription('ar'),
                    'image_url' => $category->image_url,
                    'products_count' => $productsCount,
                    'created_at' => $category->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create new category
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Generate slug if not provided
            $slug = $request->slug ?? Str::slug($request->name_en);
            
            // Ensure slug is unique
            $originalSlug = $slug;
            $counter = 1;
            while (Category::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Create category
            $category = Category::create([
                'slug' => $slug,
                'image_url' => $request->image_url,
            ]);

            // Create translations
            CategoryTranslation::create([
                'category_id' => $category->id,
                'locale' => 'en',
                'name' => $request->name_en,
                'description' => $request->description_en,
            ]);

            CategoryTranslation::create([
                'category_id' => $category->id,
                'locale' => 'ar',
                'name' => $request->name_ar,
                'description' => $request->description_ar,
            ]);

            // Load relationships
            $category->load('translations');

            DB::commit();

            \Log::info('Category created', [
                'category_id' => $category->id,
                'name' => $request->name_en,
                'created_by' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => [
                    'id' => $category->id,
                    'name' => $category->getName('en'),
                    'name_ar' => $category->getName('ar'),
                    'slug' => $category->slug,
                    'description' => $category->getDescription('en'),
                    'description_ar' => $category->getDescription('ar'),
                    'image_url' => $category->image_url,
                    'products_count' => 0,
                    'created_at' => $category->created_at,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create category', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update category
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $id,
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $category = Category::findOrFail($id);

            // Generate slug if not provided
            $slug = $request->slug ?? Str::slug($request->name_en);
            
            // Ensure slug is unique (excluding current category)
            if ($slug !== $category->slug) {
                $originalSlug = $slug;
                $counter = 1;
                while (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                    $slug = $originalSlug . '-' . $counter;
                    $counter++;
                }
            }

            // Update category
            $category->update([
                'slug' => $slug,
                'image_url' => $request->image_url,
            ]);

            // Update or create translations
            CategoryTranslation::updateOrCreate(
                ['category_id' => $category->id, 'locale' => 'en'],
                ['name' => $request->name_en, 'description' => $request->description_en]
            );

            CategoryTranslation::updateOrCreate(
                ['category_id' => $category->id, 'locale' => 'ar'],
                ['name' => $request->name_ar, 'description' => $request->description_ar]
            );

            // Load relationships
            $category->load('translations');

            DB::commit();

            \Log::info('Category updated', [
                'category_id' => $category->id,
                'name' => $request->name_en,
                'updated_by' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => [
                    'id' => $category->id,
                    'name' => $category->getName('en'),
                    'name_ar' => $category->getName('ar'),
                    'slug' => $category->slug,
                    'description' => $category->getDescription('en'),
                    'description_ar' => $category->getDescription('ar'),
                    'image_url' => $category->image_url,
                    'products_count' => $category->products()->count(),
                    'created_at' => $category->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to update category', [
                'category_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete category
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $category = Category::findOrFail($id);

            // Check if category has products
            $productsCount = 0;
            try {
                $productsCount = $category->products()->count();
            } catch (\Exception $e) {
                // If relationship doesn't work, allow deletion
            }
            
            if ($productsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete category with {$productsCount} product(s). Please reassign or delete products first."
                ], 400);
            }

            $categoryName = $category->getName('en');
            
            // Delete translations first
            $category->translations()->delete();
            
            // Delete category
            $category->delete();

            DB::commit();

            \Log::info('Category deleted', [
                'category_id' => $id,
                'name' => $categoryName,
                'deleted_by' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to delete category', [
                'category_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
