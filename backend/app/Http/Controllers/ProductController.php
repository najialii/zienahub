<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Requests\ProductFilterRequest;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $locale = $request->header('Accept-Language', 'en');
        
        $query = Product::with(['subcategory.category', 'translations']);

        if ($request->has('category_id')) {
            $query->whereHas('subcategory', function($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        if ($request->has('subcategory_id')) {
            $query->where('subcategory_id', $request->subcategory_id);
        }

        $products = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($product) use ($locale) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'description' => $product->description,
                    'price' => (float) $product->price,
                    'stock_quantity' => $product->stock_quantity,
                    'image_url' => $product->image_url ? url($product->image_url) : null,
                    'status' => $product->status,
                    'sku' => $product->sku,
                    'subcategory_id' => $product->subcategory_id,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'subcategory' => $product->subcategory ? [
                        'id' => $product->subcategory->id,
                        'name' => $product->subcategory->name,
                        'category' => $product->subcategory->category ? [
                            'id' => $product->subcategory->category->id,
                            'name' => $product->subcategory->category->name,
                        ] : null,
                    ] : null,
                    'category' => $product->subcategory && $product->subcategory->category ? [
                        'id' => $product->subcategory->category->id,
                        'name' => $product->subcategory->category->name,
                    ] : null,
                ];
            });

        return response()->json($products);
    }

    public function show(Request $request, $id)
    {
        $locale = $request->header('Accept-Language', 'en');
        
        $product = Product::with(['subcategory.category'])->findOrFail($id);

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => (float) $product->price,
            'stock_quantity' => $product->stock_quantity,
            'image_url' => $product->image_url ? url($product->image_url) : null,
            'status' => $product->status,
            'sku' => $product->sku,
            'subcategory_id' => $product->subcategory_id,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
            'subcategory' => $product->subcategory ? [
                'id' => $product->subcategory->id,
                'name' => $product->subcategory->name,
                'category' => $product->subcategory->category ? [
                    'id' => $product->subcategory->category->id,
                    'name' => $product->subcategory->category->name,
                ] : null,
            ] : null,
            'category' => $product->subcategory && $product->subcategory->category ? [
                'id' => $product->subcategory->category->id,
                'name' => $product->subcategory->category->name,
            ] : null,
        ]);
    }

    public function showBySlug(Request $request, $slug)
    {
        $locale = $request->header('Accept-Language', 'en');
        
        $product = Product::with(['subcategory.category'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'description' => $product->description,
            'price' => (float) $product->price,
            'stock_quantity' => $product->stock_quantity,
            'image_url' => $product->image_url ? url($product->image_url) : null,
            'status' => $product->status,
            'subcategory_id' => $product->subcategory_id,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
            'subcategory' => $product->subcategory ? [
                'id' => $product->subcategory->id,
                'name' => $product->subcategory->name,
                'category' => $product->subcategory->category ? [
                    'id' => $product->subcategory->category->id,
                    'name' => $product->subcategory->category->name,
                    'slug' => $product->subcategory->category->slug,
                ] : null,
            ] : null,
            'category' => $product->subcategory && $product->subcategory->category ? [
                'id' => $product->subcategory->category->id,
                'name' => $product->subcategory->category->name,
                'slug' => $product->subcategory->category->slug,
            ] : null,
        ]);
    }

    public function getRelatedProducts(Request $request, $slug)
    {
        $locale = $request->header('Accept-Language', 'en');
        
        try {
            // Get the current product
            $product = Product::where('slug', $slug)->firstOrFail();
            
            $allRelatedProducts = collect();
            $usedProductIds = [$product->id];
            
            // Helper function to format product data
            $formatProduct = function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'stock_quantity' => $product->stock_quantity,
                    'image_url' => $product->image_url ? url($product->image_url) : null,
                    'sku' => $product->sku,
                    'category' => $product->subcategory && $product->subcategory->category ? [
                        'id' => $product->subcategory->category->id,
                        'name' => $product->subcategory->category->name,
                        'slug' => $product->subcategory->category->slug,
                    ] : null,
                ];
            };
            
            // Step 1: Get products from same subcategory
            if ($product->subcategory_id && $allRelatedProducts->count() < 4) {
                $subcategoryProducts = Product::with(['subcategory.category'])
                    ->where('subcategory_id', $product->subcategory_id)
                    ->whereNotIn('id', $usedProductIds)
                    ->where('status', 'active')
                    ->inStock()
                    ->inRandomOrder()
                    ->limit(4 - $allRelatedProducts->count())
                    ->get();
                
                foreach ($subcategoryProducts as $relatedProduct) {
                    $allRelatedProducts->push($formatProduct($relatedProduct));
                    $usedProductIds[] = $relatedProduct->id;
                }
            }
            
            // Step 2: If not enough, get products from same category
            if ($product->subcategory && $product->subcategory->category && $allRelatedProducts->count() < 4) {
                $categoryProducts = Product::with(['subcategory.category'])
                    ->whereHas('subcategory', function($q) use ($product) {
                        $q->where('category_id', $product->subcategory->category->id);
                    })
                    ->whereNotIn('id', $usedProductIds)
                    ->where('status', 'active')
                    ->inStock()
                    ->inRandomOrder()
                    ->limit(4 - $allRelatedProducts->count())
                    ->get();
                
                foreach ($categoryProducts as $relatedProduct) {
                    $allRelatedProducts->push($formatProduct($relatedProduct));
                    $usedProductIds[] = $relatedProduct->id;
                }
            }
            
            // Step 3: If still not enough, get any other active products
            if ($allRelatedProducts->count() < 4) {
                $otherProducts = Product::with(['subcategory.category'])
                    ->whereNotIn('id', $usedProductIds)
                    ->where('status', 'active')
                    ->inStock()
                    ->inRandomOrder()
                    ->limit(4 - $allRelatedProducts->count())
                    ->get();
                
                foreach ($otherProducts as $relatedProduct) {
                    $allRelatedProducts->push($formatProduct($relatedProduct));
                    $usedProductIds[] = $relatedProduct->id;
                }
            }
            
            return response()->json($allRelatedProducts->values()->toArray());
            
        } catch (\Exception $e) {
            \Log::error('Error fetching related products: ' . $e->getMessage(), [
                'slug' => $slug,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch related products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Admin methods
    public function adminIndex(ProductFilterRequest $request)
    {
        try {
            $query = Product::with(['subcategory.category', 'translations']);

            // Search across multiple fields
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%$search%")
                      ->orWhere('sku', 'like', "%$search%")
                      ->orWhere('description', 'like', "%$search%");
                });
            }

            // Filter by category (through subcategory relationship)
            if ($request->filled('category_id')) {
                $query->whereHas('subcategory', function($q) use ($request) {
                    $q->where('category_id', $request->category_id);
                });
            }

            // Filter by subcategory
            if ($request->filled('subcategory_id')) {
                $query->where('subcategory_id', $request->subcategory_id);
            }

            // Filter by product status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Filter by price range
            if ($request->filled('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->filled('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }

            // Filter by stock status
            if ($request->filled('stock_status')) {
                switch ($request->stock_status) {
                    case 'in-stock':
                        $query->where('stock_quantity', '>', 10);
                        break;
                    case 'low-stock':
                        $query->whereBetween('stock_quantity', [1, 10]);
                        break;
                    case 'out-of-stock':
                        $query->where('stock_quantity', '=', 0);
                        break;
                }
            }

            // Sorting with validation
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            // Validate sort column exists in products table
            $allowedSortFields = ['name', 'price', 'stock_quantity', 'created_at', 'updated_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Pagination with limits
            $perPage = min($request->get('per_page', 10), 100);
            $products = $query->paginate($perPage);

            // Format the products data to include full URLs and proper structure
            $formattedProducts = $products->getCollection()->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'sku' => $product->sku,
                    'description' => $product->description,
                    'price' => (float) $product->price,
                    'stock_quantity' => $product->stock_quantity,
                    'image_url' => $product->image_url ? url($product->image_url) : null,
                    'status' => $product->status,
                    'subcategory_id' => $product->subcategory_id,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'subcategory' => $product->subcategory ? [
                        'id' => $product->subcategory->id,
                        'name' => $product->subcategory->name,
                        'category' => $product->subcategory->category ? [
                            'id' => $product->subcategory->category->id,
                            'name' => $product->subcategory->category->name,
                        ] : null,
                    ] : null,
                    'category' => $product->subcategory && $product->subcategory->category ? [
                        'id' => $product->subcategory->category->id,
                        'name' => $product->subcategory->category->name,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedProducts,
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'from' => $products->firstItem(),
                    'to' => $products->lastItem(),
                ]
            ], 200);

        } catch (Exception $e) {
            Log::error('Error fetching products: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while fetching products'
            ], 500);
        }
    }

    public function adminShow($id)
    {
        try {
            $product = Product::with(['subcategory.category', 'translations'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $product
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
                'error' => "Product with ID {$id} does not exist"
            ], 404);

        } catch (Exception $e) {
            Log::error('Error fetching product: ' . $e->getMessage(), [
                'product_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while fetching the product'
            ], 500);
        }
    }

    public function store(StoreProductRequest $request)
    {
        try {
            // Debug: Log the incoming request data
            Log::info('Product creation request data:', $request->all());
            
            $validated = $request->validated();
            
            // Extract translation fields
            $name = $validated['name'];
            $description = $validated['description'];
            $nameAr = $validated['name_ar'] ?? $name;
            $descriptionAr = $validated['description_ar'] ?? $description;
            unset($validated['name'], $validated['description'], $validated['name_ar'], $validated['description_ar']);
            
            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('images/products', $imageName, 'public');
                $validated['image_url'] = '/storage/' . $imagePath;
            }
            
            // Set default status if not provided
            if (!isset($validated['status'])) {
                $validated['status'] = 'active';
            }

            // Create the product
            $product = Product::create($validated);
            
            // Create translations for both English and Arabic
            $product->translations()->create([
                'locale' => 'en',
                'name' => $name,
                'description' => $description,
            ]);
            
            $product->translations()->create([
                'locale' => 'ar',
                'name' => $nameAr,
                'description' => $descriptionAr,
            ]);
            
            $product->load('subcategory.category', 'translations');

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);

        } catch (Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage(), [
                'data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while creating the product'
            ], 500);
        }
    }

    public function update(UpdateProductRequest $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
            $validated = $request->validated();

            // Extract translation fields if they exist
            $name = null;
            $description = null;
            $nameAr = null;
            $descriptionAr = null;
            
            if (isset($validated['name'])) {
                $name = $validated['name'];
                unset($validated['name']);
            }
            if (isset($validated['description'])) {
                $description = $validated['description'];
                unset($validated['description']);
            }
            if (isset($validated['name_ar'])) {
                $nameAr = $validated['name_ar'];
                unset($validated['name_ar']);
            }
            if (isset($validated['description_ar'])) {
                $descriptionAr = $validated['description_ar'];
                unset($validated['description_ar']);
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($product->image_url) {
                    $oldImagePath = str_replace('/storage/', '', $product->image_url);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('images/products', $imageName, 'public');
                $validated['image_url'] = '/storage/' . $imagePath;
            }

            // Update the product
            $product->update($validated);
            
            // Update translations if name or description provided
            if ($name || $description || $nameAr || $descriptionAr) {
                // Update English translation
                if ($name || $description) {
                    $enTranslation = $product->translations()->where('locale', 'en')->first();
                    if ($enTranslation) {
                        $enTranslation->update([
                            'name' => $name ?: $enTranslation->name,
                            'description' => $description ?: $enTranslation->description,
                        ]);
                    } else {
                        $product->translations()->create([
                            'locale' => 'en',
                            'name' => $name,
                            'description' => $description,
                        ]);
                    }
                }
                
                // Update Arabic translation
                if ($nameAr || $descriptionAr) {
                    $arTranslation = $product->translations()->where('locale', 'ar')->first();
                    if ($arTranslation) {
                        $arTranslation->update([
                            'name' => $nameAr ?: $arTranslation->name,
                            'description' => $descriptionAr ?: $arTranslation->description,
                        ]);
                    } else {
                        $product->translations()->create([
                            'locale' => 'ar',
                            'name' => $nameAr ?: $name,
                            'description' => $descriptionAr ?: $description,
                        ]);
                    }
                } else if ($name || $description) {
                    // If only English provided, also update Arabic with same values
                    $arTranslation = $product->translations()->where('locale', 'ar')->first();
                    if ($arTranslation) {
                        $arTranslation->update([
                            'name' => $name ?: $arTranslation->name,
                            'description' => $description ?: $arTranslation->description,
                        ]);
                    } else {
                        $product->translations()->create([
                            'locale' => 'ar',
                            'name' => $name,
                            'description' => $description,
                        ]);
                    }
                }
            }
            
            $product->load('subcategory.category', 'translations');

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
                'error' => "Product with ID {$id} does not exist"
            ], 404);

        } catch (Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage(), [
                'product_id' => $id,
                'data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while updating the product'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            $productName = $product->name;
            
            // Delete associated image if exists
            if ($product->image_url) {
                $imagePath = str_replace('/storage/', '', $product->image_url);
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
            
            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
                'data' => [
                    'id' => $id,
                    'name' => $productName
                ]
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
                'error' => "Product with ID {$id} does not exist"
            ], 404);

        } catch (Exception $e) {
            Log::error('Error deleting product: ' . $e->getMessage(), [
                'product_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while deleting the product'
            ], 500);
        }
    }
}
