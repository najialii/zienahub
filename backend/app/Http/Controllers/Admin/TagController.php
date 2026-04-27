<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Tag::query();

            // Filter by type
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            // Filter by status
            if ($request->filled('status')) {
                $query->where('is_active', $request->status === 'active');
            }

            // Search
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name_en', 'like', "%{$search}%")
                      ->orWhere('name_ar', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            $tags = $query->get();

            return response()->json([
                'success' => true,
                'data' => $tags,
                'types' => [
                    'occasion' => 'Occasion',
                    'giftee' => 'Giftee',
                    'style' => 'Style',
                    'season' => 'Season',
                    'age_group' => 'Age Group',
                    'other' => 'Other'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching tags: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:tags,slug',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'type' => 'required|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
            'image_url' => 'nullable|url|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'starts_at ' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'discount_percentage' => 'integer|nullable',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name_en']);
        }

        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Tag::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $tag = Tag::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tag created successfully',
            'data' => $tag
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag)
    {
        $tag->load('products');
        
        return response()->json([
            'success' => true,
            'data' => $tag
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('tags', 'slug')->ignore($tag->id)
            ],
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            // 'type' => 'required|in:occasion,giftee,style,season,age_group,other',
            'type' => 'required|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
            'image_url' => 'nullable|url|max:500',
            'starts_at ' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'discount_percentage' => 'integer|nullable',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name_en']);
        }

        // Ensure unique slug
        if ($validated['slug'] !== $tag->slug) {
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Tag::where('slug', $validated['slug'])->where('id', '!=', $tag->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $tag->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tag updated successfully',
            'data' => $tag
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag)
    {
        // Check if tag is used by products
        if ($tag->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete tag that is assigned to products'
            ], 422);
        }

        $tag->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tag deleted successfully'
        ]);
    }

    /**
     * Get tags for product assignment.
     */
    public function forProducts(Request $request)
    {
        $query = Tag::active();

        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        $tags = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $tags
        ]);
    }

    /**
     * Bulk update tag status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'exists:tags,id',
            'is_active' => 'required|boolean'
        ]);

        Tag::whereIn('id', $validated['tag_ids'])
            ->update(['is_active' => $validated['is_active']]);

        return response()->json([
            'success' => true,
            'message' => 'Tags updated successfully'
        ]);
    }
}