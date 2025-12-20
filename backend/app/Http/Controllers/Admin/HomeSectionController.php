<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomeSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class HomeSectionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = HomeSection::query();

            // Filter by type
            if ($request->filled('type')) {
                $query->ofType($request->type);
            }

            // Filter by status
            if ($request->filled('status')) {
                if ($request->status === 'active') {
                    $query->active();
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // Search
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%$search%")
                      ->orWhere('title_en', 'like', "%$search%")
                      ->orWhere('title_ar', 'like', "%$search%");
                });
            }

            $sections = $query->ordered()->get();

            return response()->json([
                'success' => true,
                'data' => $sections
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch home sections',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $section = HomeSection::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $section
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Home section not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:home_sections,name',
                'type' => 'required|in:hero_slider,banner,product_row,featured_tags,custom',
                'title_en' => 'nullable|string|max:255',
                'title_ar' => 'nullable|string|max:255',
                'description_en' => 'nullable|string',
                'description_ar' => 'nullable|string',
                'settings' => 'nullable|array',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $section = HomeSection::create($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Home section created successfully',
                'data' => $section
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create home section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $section = HomeSection::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:home_sections,name,' . $id,
                'type' => 'required|in:hero_slider,banner,product_row,featured_tags,custom',
                'title_en' => 'nullable|string|max:255',
                'title_ar' => 'nullable|string|max:255',
                'description_en' => 'nullable|string',
                'description_ar' => 'nullable|string',
                'settings' => 'nullable|array',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $section->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Home section updated successfully',
                'data' => $section
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update home section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $section = HomeSection::findOrFail($id);
            $section->delete();

            return response()->json([
                'success' => true,
                'message' => 'Home section deleted successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete home section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $section = HomeSection::findOrFail($id);
            $section->update(['is_active' => !$section->is_active]);

            return response()->json([
                'success' => true,
                'message' => 'Home section status updated successfully',
                'data' => $section
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update home section status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateSortOrder(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'sections' => 'required|array',
                'sections.*.id' => 'required|exists:home_sections,id',
                'sections.*.sort_order' => 'required|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            foreach ($request->sections as $sectionData) {
                HomeSection::where('id', $sectionData['id'])
                    ->update(['sort_order' => $sectionData['sort_order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Home section order updated successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update home section order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}