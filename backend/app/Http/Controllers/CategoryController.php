<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $locale = $request->header('Accept-Language', 'en');
        
        $categories = Category::with(['subcategories', 'translations'])
            ->get()
            ->map(function ($category) use ($locale) {
                return [
                    'id' => $category->id,
                    'name' => $category->getName($locale) ?: $category->getName('en'),
                    'slug' => $category->slug,
                    'description' => $category->getDescription($locale) ?: $category->getDescription('en'),
                    'image_url' => $category->image_url ? url($category->image_url) : null,
                ];
            });

        return response()->json($categories);
    }

    public function show(Request $request, $id)
    {
        $locale = $request->header('Accept-Language', 'en');
        
        $category = Category::with(['subcategories', 'products', 'translations'])->findOrFail($id);

        return response()->json([
            'id' => $category->id,
            'name' => $category->getName($locale) ?: $category->getName('en'),
            'slug' => $category->slug,
            'description' => $category->getDescription($locale) ?: $category->getDescription('en'),
            'image_url' => $category->image_url ? url($category->image_url) : null,
            'subcategories' => $category->subcategories->map(function ($sub) use ($locale) {
                return [
                    'id' => $sub->id,
                    'name' => $sub->name,
                    'slug' => $sub->slug,
                ];
            }),
        ]);
    }

    public function showBySlug(Request $request, $slug)
    {
        $locale = $request->header('Accept-Language', 'en');
        
        $category = Category::with(['subcategories', 'products', 'translations'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'id' => $category->id,
            'name' => $category->getName($locale) ?: $category->getName('en'),
            'slug' => $category->slug,
            'description' => $category->getDescription($locale) ?: $category->getDescription('en'),
            'image_url' => $category->image_url ? url($category->image_url) : null,
            'subcategories' => $category->subcategories->map(function ($sub) use ($locale) {
                return [
                    'id' => $sub->id,
                    'name' => $sub->name,
                    'slug' => $sub->slug,
                ];
            }),
        ]);
    }
}
