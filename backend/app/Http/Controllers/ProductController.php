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
        
        $query = Product::with(['subcategory.category', 'translations', 'tag']);

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
                    'tag_id' => $product->tag_id,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'subcategory' => $product->subcategory ? [
                        'id' => $product->subcategory->id,
                        'name' => $product->subcategory->name,
                        'slug' => $product->subcategory->slug ?? '',
                        'category' => $product->subcategory->category ? [
                            'id' => $product->subcategory->category->id,
                            'name' => $product->subcategory->category->name,
                            'slug' => $product->subcategory->category->slug ?? '',
                        ] : null,
                    ] : null,
                    'category' => $product->subcategory && $product->subcategory->category ? [
                        'id' => $product->subcategory->category->id,
                        'name' => $product->subcategory->category->name,
                        'slug' => $product->subcategory->category->slug ?? '',
                    ] : null,
                    'tag' => $product->tag ? [
                        'id' => $product->tag->id,
                        'name_en' => $product->tag->name_en,
                        'name_ar' => $product->tag->name_ar,
                        'slug' => $product->tag->slug,
                    ] : null,
                ];
            });

        return response()->json($products);
    }

    public function show(Request $request, $id)
    {
        $locale = $request->header('Accept-Language', 'en');
        
        $product = Product::with(['subcategory.category', 'productimg'])->findOrFail($id);

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
        
        $product = Product::with(['subcategory.category', 'productimg'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'description' => $product->description,
            'how_to_use' => $product->how_to_use,
            'ingredients' => $product->ingredients,
            'benefits' => $product->benefits,
            'brand' => $product->brand,
            'size' => $product->size,
            'country_of_origin' => $product->country_of_origin,
            'price' => (float) $product->price,
            'stock_quantity' => $product->stock_quantity,
            'image_url' => $product->image_url ? url($product->image_url) : null,
            'images' => $product->productimg ? $product->productimg->map(function ($img) {
                return [
                    'id' => $img->id,
                    'image_url' => url($img->img_path),
                    'sort_order' => $img->sort_order
                ];
            })->sortBy('sort_order')->values()->all() : [],
            'status' => $product->status,
            'tenant_id'=> $product->tenant_id,
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
            $product = Product::with(['subcategory.category', 'translations', 'productimg'])->findOrFail($id);
            
            // Format product images properly for the admin interface
            $productData = $product->toArray();
            $productData['images'] = $product->productimg ? $product->productimg->map(function ($img) {
                return [
                    'id' => $img->id,
                    'image_url' => url($img->img_path),
                    'sort_order' => $img->sort_order
                ];
            })->sortBy('sort_order')->values()->all() : [];
            
            return response()->json([
                'success' => true,
                'data' => $productData
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
            $howToUse = $validated['how_to_use'] ?? null;
            $ingredients = $validated['ingredients'] ?? null;
            $benefits = $validated['benefits'] ?? null;
            $howToUseAr = $validated['how_to_use_ar'] ?? $howToUse;
            $ingredientsAr = $validated['ingredients_ar'] ?? $ingredients;
            $benefitsAr = $validated['benefits_ar'] ?? $benefits;
            
            unset(
                $validated['name'], $validated['description'], 
                $validated['name_ar'], $validated['description_ar'],
                $validated['how_to_use'], $validated['ingredients'], $validated['benefits'],
                $validated['how_to_use_ar'], $validated['ingredients_ar'], $validated['benefits_ar']
            );
            
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
                'how_to_use' => $howToUse,
                'ingredients' => $ingredients,
                'benefits' => $benefits,
            ]);
            
            $product->translations()->create([
                'locale' => 'ar',
                'name' => $nameAr,
                'description' => $descriptionAr,
                'how_to_use' => $howToUseAr,
                'ingredients' => $ingredientsAr,
                'benefits' => $benefitsAr,
            ]);
            
            // Handle multiple gallery images
            if ($request->hasFile('gallery_images')) {
                $sortOrder = 1;
                foreach ($request->file('gallery_images') as $galleryImage) {
                    $imageName = time() . '_' . uniqid() . '_' . $galleryImage->getClientOriginalName();
                    $imagePath = $galleryImage->storeAs('images/products/gallery', $imageName, 'public');
                    $product->productimg()->create([
                        'img_path' => '/storage/' . $imagePath,
                        'sort_order' => $sortOrder++
                    ]);
                }
            }
            
            $product->load('subcategory.category', 'translations', 'productimg');

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
            $howToUse = null;
            $ingredients = null;
            $benefits = null;
            $nameAr = null;
            $descriptionAr = null;
            $howToUseAr = null;
            $ingredientsAr = null;
            $benefitsAr = null;
            
            if (isset($validated['name'])) { $name = $validated['name']; unset($validated['name']); }
            if (isset($validated['description'])) { $description = $validated['description']; unset($validated['description']); }
            if (isset($validated['how_to_use'])) { $howToUse = $validated['how_to_use']; unset($validated['how_to_use']); }
            if (isset($validated['ingredients'])) { $ingredients = $validated['ingredients']; unset($validated['ingredients']); }
            if (isset($validated['benefits'])) { $benefits = $validated['benefits']; unset($validated['benefits']); }
            
            if (isset($validated['name_ar'])) { $nameAr = $validated['name_ar']; unset($validated['name_ar']); }
            if (isset($validated['description_ar'])) { $descriptionAr = $validated['description_ar']; unset($validated['description_ar']); }
            if (isset($validated['how_to_use_ar'])) { $howToUseAr = $validated['how_to_use_ar']; unset($validated['how_to_use_ar']); }
            if (isset($validated['ingredients_ar'])) { $ingredientsAr = $validated['ingredients_ar']; unset($validated['ingredients_ar']); }
            if (isset($validated['benefits_ar'])) { $benefitsAr = $validated['benefits_ar']; unset($validated['benefits_ar']); }

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
            
            // Update translations if any text fields provided
            if ($name || $description || $nameAr || $descriptionAr || $howToUse || $ingredients || $benefits || $howToUseAr || $ingredientsAr || $benefitsAr) {
                // Update English translation
                if ($name || $description || $howToUse || $ingredients || $benefits) {
                    $enTranslation = $product->translations()->where('locale', 'en')->first();
                    if ($enTranslation) {
                        $enTranslation->update([
                            'name' => $name ?: $enTranslation->name,
                            'description' => $description !== null ? $description : $enTranslation->description,
                            'how_to_use' => $howToUse !== null ? $howToUse : $enTranslation->how_to_use,
                            'ingredients' => $ingredients !== null ? $ingredients : $enTranslation->ingredients,
                            'benefits' => $benefits !== null ? $benefits : $enTranslation->benefits,
                        ]);
                    } else {
                        $product->translations()->create([
                            'locale' => 'en',
                            'name' => $name,
                            'description' => $description,
                            'how_to_use' => $howToUse,
                            'ingredients' => $ingredients,
                            'benefits' => $benefits,
                        ]);
                    }
                }
                
                // Update Arabic translation
                if ($nameAr || $descriptionAr || $howToUseAr || $ingredientsAr || $benefitsAr) {
                    $arTranslation = $product->translations()->where('locale', 'ar')->first();
                    if ($arTranslation) {
                        $arTranslation->update([
                            'name' => $nameAr ?: $arTranslation->name,
                            'description' => $descriptionAr !== null ? $descriptionAr : $arTranslation->description,
                            'how_to_use' => $howToUseAr !== null ? $howToUseAr : $arTranslation->how_to_use,
                            'ingredients' => $ingredientsAr !== null ? $ingredientsAr : $arTranslation->ingredients,
                            'benefits' => $benefitsAr !== null ? $benefitsAr : $arTranslation->benefits,
                        ]);
                    } else {
                        $product->translations()->create([
                            'locale' => 'ar',
                            'name' => $nameAr ?: $name,
                            'description' => $descriptionAr !== null ? $descriptionAr : $description,
                            'how_to_use' => $howToUseAr !== null ? $howToUseAr : $howToUse,
                            'ingredients' => $ingredientsAr !== null ? $ingredientsAr : $ingredients,
                            'benefits' => $benefitsAr !== null ? $benefitsAr : $benefits,
                        ]);
                    }
                } else if ($name || $description || $howToUse || $ingredients || $benefits) {
                    // If only English provided, also update Arabic with same values
                    $arTranslation = $product->translations()->where('locale', 'ar')->first();
                    if ($arTranslation) {
                        $arTranslation->update([
                            'name' => $name ?: $arTranslation->name,
                            'description' => $description !== null ? $description : $arTranslation->description,
                            'how_to_use' => $howToUse !== null ? $howToUse : $arTranslation->how_to_use,
                            'ingredients' => $ingredients !== null ? $ingredients : $arTranslation->ingredients,
                            'benefits' => $benefits !== null ? $benefits : $arTranslation->benefits,
                        ]);
                    } else {
                        $product->translations()->create([
                            'locale' => 'ar',
                            'name' => $name,
                            'description' => $description,
                            'how_to_use' => $howToUse,
                            'ingredients' => $ingredients,
                            'benefits' => $benefits,
                        ]);
                    }
                }
            }
            
            // Handle multiple gallery images appending
            if ($request->hasFile('gallery_images')) {
                $maxSortOrder = $product->productimg()->max('sort_order') ?? 0;
                $sortOrder = $maxSortOrder + 1;
                
                foreach ($request->file('gallery_images') as $galleryImage) {
                    $imageName = time() . '_' . uniqid() . '_' . $galleryImage->getClientOriginalName();
                    $imagePath = $galleryImage->storeAs('images/products/gallery', $imageName, 'public');
                    $product->productimg()->create([
                        'img_path' => '/storage/' . $imagePath,
                        'sort_order' => $sortOrder++
                    ]);
                }
            }
            
            $product->load('subcategory.category', 'translations', 'productimg');

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
