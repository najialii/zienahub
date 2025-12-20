<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subcategory;
use App\Models\SubcategoryTranslation;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SubcategoryController extends Controller
{
    /**
     * Get all subcategories for admin
     */
    public function index(Request $request)
    {
        try {
            $query = Subcategory::with(['category.translations', 'translations']);

            // Filter by category if provided
            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->whereHas('translations', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            }

            // Order by created_at (most recent first)
            $query->orderBy('created_at', 'desc');

            $subcategories = $query->get()->map(function($subcategory) {
                // Try to get products count
                $productsCount = 0;
                try {
                    $productsCount = $subcategory->products()->count();
                } catch (\Exception $e) {
                    // Relationship might not exist
                }

                return [
                    'id' => $subcategory->id,
                    'name' => $subcategory->getName('en'),
                    'name_ar' => $subcategory->getName('ar'),
                    'slug' => $subcategory->slug,
                    'description' => $subcategory->getDescription('en'),
                    'description_ar' => $subcategory->getDescription('ar'),
                    'category_id' => $subcategory->category_id,
                    'is_featured' => $subcategory->is_featured,
                    'featured_sort_order' => $subcategory->featured_sort_order,
                    'category' => $subcategory->category ? [
                        'id' => $subcategory->category->id,
                        'name' => $subcategory->category->getName('en'),
                        'name_ar' => $subcategory->category->getName('ar'),
                    ] : null,
                    'products_count' => $productsCount,
                    'created_at' => $subcategory->created_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $subcategories
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch subcategories', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subcategories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single subcategory
     */
    public function show($id)
    {
        try {
            $subcategory = Subcategory::with(['category.translations', 'translations'])->findOrFail($id);
            
            // Try to get products count
            $productsCount = 0;
            try {
                $productsCount = $subcategory->products()->count();
            } catch (\Exception $e) {
                // Relationship might not exist
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $subcategory->id,
                    'name' => $subcategory->getName('en'),
                    'name_ar' => $subcategory->getName('ar'),
                    'slug' => $subcategory->slug,
                    'description' => $subcategory->getDescription('en'),
                    'description_ar' => $subcategory->getDescription('ar'),
                    'category_id' => $subcategory->category_id,
                    'category' => $subcategory->category ? [
                        'id' => $subcategory->category->id,
                        'name' => $subcategory->category->getName('en'),
                        'name_ar' => $subcategory->category->getName('ar'),
                    ] : null,
                    'products_count' => $productsCount,
                    'created_at' => $subcategory->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Subcategory not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create new subcategory
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:subcategories,slug',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
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
            while (Subcategory::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Create subcategory
            $subcategory = Subcategory::create([
                'category_id' => $request->category_id,
                'slug' => $slug,
            ]);

            // Create translations
            SubcategoryTranslation::create([
                'subcategory_id' => $subcategory->id,
                'locale' => 'en',
                'name' => $request->name_en,
                'description' => $request->description_en,
            ]);

            SubcategoryTranslation::create([
                'subcategory_id' => $subcategory->id,
                'locale' => 'ar',
                'name' => $request->name_ar,
                'description' => $request->description_ar,
            ]);

            // Load relationships
            $subcategory->load(['category.translations', 'translations']);

            DB::commit();

            \Log::info('Subcategory created', [
                'subcategory_id' => $subcategory->id,
                'name' => $request->name_en,
                'category_id' => $subcategory->category_id,
                'created_by' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subcategory created successfully',
                'data' => [
                    'id' => $subcategory->id,
                    'name' => $subcategory->getName('en'),
                    'name_ar' => $subcategory->getName('ar'),
                    'slug' => $subcategory->slug,
                    'description' => $subcategory->getDescription('en'),
                    'description_ar' => $subcategory->getDescription('ar'),
                    'category_id' => $subcategory->category_id,
                    'category' => $subcategory->category ? [
                        'id' => $subcategory->category->id,
                        'name' => $subcategory->category->getName('en'),
                        'name_ar' => $subcategory->category->getName('ar'),
                    ] : null,
                    'products_count' => 0,
                    'created_at' => $subcategory->created_at,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create subcategory', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create subcategory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update subcategory
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:subcategories,slug,' . $id,
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
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

            $subcategory = Subcategory::findOrFail($id);

            // Generate slug if not provided
            $slug = $request->slug ?? Str::slug($request->name_en);
            
            // Ensure slug is unique (excluding current subcategory)
            if ($slug !== $subcategory->slug) {
                $originalSlug = $slug;
                $counter = 1;
                while (Subcategory::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                    $slug = $originalSlug . '-' . $counter;
                    $counter++;
                }
            }

            // Update subcategory
            $subcategory->update([
                'category_id' => $request->category_id,
                'slug' => $slug,
            ]);

            // Update or create translations
            SubcategoryTranslation::updateOrCreate(
                ['subcategory_id' => $subcategory->id, 'locale' => 'en'],
                ['name' => $request->name_en, 'description' => $request->description_en]
            );

            SubcategoryTranslation::updateOrCreate(
                ['subcategory_id' => $subcategory->id, 'locale' => 'ar'],
                ['name' => $request->name_ar, 'description' => $request->description_ar]
            );

            // Load relationships
            $subcategory->load(['category.translations', 'translations']);

            DB::commit();

            \Log::info('Subcategory updated', [
                'subcategory_id' => $subcategory->id,
                'name' => $request->name_en,
                'category_id' => $subcategory->category_id,
                'updated_by' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subcategory updated successfully',
                'data' => [
                    'id' => $subcategory->id,
                    'name' => $subcategory->getName('en'),
                    'name_ar' => $subcategory->getName('ar'),
                    'slug' => $subcategory->slug,
                    'description' => $subcategory->getDescription('en'),
                    'description_ar' => $subcategory->getDescription('ar'),
                    'category_id' => $subcategory->category_id,
                    'category' => $subcategory->category ? [
                        'id' => $subcategory->category->id,
                        'name' => $subcategory->category->getName('en'),
                        'name_ar' => $subcategory->category->getName('ar'),
                    ] : null,
                    'products_count' => $subcategory->products()->count(),
                    'created_at' => $subcategory->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to update subcategory', [
                'subcategory_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update subcategory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete subcategory
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $subcategory = Subcategory::findOrFail($id);

            // Check if subcategory has products
            $productsCount = 0;
            try {
                $productsCount = $subcategory->products()->count();
            } catch (\Exception $e) {
                // If relationship doesn't work, allow deletion
            }
            
            if ($productsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete subcategory with {$productsCount} product(s). Please reassign or delete products first."
                ], 400);
            }

            $subcategoryName = $subcategory->getName('en');
            
            // Delete translations first
            $subcategory->translations()->delete();
            
            // Delete subcategory
            $subcategory->delete();

            DB::commit();

            \Log::info('Subcategory deleted', [
                'subcategory_id' => $id,
                'name' => $subcategoryName,
                'deleted_by' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subcategory deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to delete subcategory', [
                'subcategory_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete subcategory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle featured status
     */
    public function toggleFeatured($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);
            
            $subcategory->update([
                'is_featured' => !$subcategory->is_featured,
                // Set sort order if becoming featured
                'featured_sort_order' => !$subcategory->is_featured ? null : ($subcategory->featured_sort_order ?? Subcategory::featured()->max('featured_sort_order') + 1)
            ]);

            // Load relationships
            $subcategory->load(['category.translations', 'translations']);

            \Log::info('Subcategory featured status toggled', [
                'subcategory_id' => $subcategory->id,
                'is_featured' => $subcategory->is_featured,
                'updated_by' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subcategory featured status updated successfully',
                'data' => [
                    'id' => $subcategory->id,
                    'name' => $subcategory->getName('en'),
                    'name_ar' => $subcategory->getName('ar'),
                    'slug' => $subcategory->slug,
                    'is_featured' => $subcategory->is_featured,
                    'featured_sort_order' => $subcategory->featured_sort_order,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to toggle subcategory featured status', [
                'subcategory_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle featured status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}