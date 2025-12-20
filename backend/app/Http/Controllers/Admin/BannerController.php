<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Exception;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Banner::query();

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
                    $q->where('title_en', 'like', "%$search%")
                      ->orWhere('title_ar', 'like', "%$search%")
                      ->orWhere('description_en', 'like', "%$search%")
                      ->orWhere('description_ar', 'like', "%$search%");
                });
            }

            $banners = $query->ordered()->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $banners->items(),
                'pagination' => [
                    'current_page' => $banners->currentPage(),
                    'last_page' => $banners->lastPage(),
                    'per_page' => $banners->perPage(),
                    'total' => $banners->total(),
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch banners',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $banner = Banner::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $banner
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Banner not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title_en' => 'required|string|max:255',
                'title_ar' => 'required|string|max:255',
                'description_en' => 'nullable|string',
                'description_ar' => 'nullable|string',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'mobile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'link_url' => 'nullable|url',
                'link_text_en' => 'nullable|string|max:255',
                'link_text_ar' => 'nullable|string|max:255',
                'type' => 'required|in:hero_slider,promotional,category_banner,sidebar_banner,footer_banner',
                'position' => 'required|in:top,middle,bottom,left,right,center',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'background_color' => 'nullable|string|max:7',
                'text_color' => 'nullable|string|max:7',
                'text_alignment' => 'required|in:left,center,right',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Handle main image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('images/banners', $imageName, 'public');
                $data['image_url'] = '/storage/' . $imagePath;
            }

            // Handle mobile image upload
            if ($request->hasFile('mobile_image')) {
                $mobileImage = $request->file('mobile_image');
                $mobileImageName = time() . '_mobile_' . $mobileImage->getClientOriginalName();
                $mobileImagePath = $mobileImage->storeAs('images/banners', $mobileImageName, 'public');
                $data['mobile_image_url'] = '/storage/' . $mobileImagePath;
            }

            $banner = Banner::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Banner created successfully',
                'data' => $banner
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $banner = Banner::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title_en' => 'required|string|max:255',
                'title_ar' => 'required|string|max:255',
                'description_en' => 'nullable|string',
                'description_ar' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'mobile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'link_url' => 'nullable|url',
                'link_text_en' => 'nullable|string|max:255',
                'link_text_ar' => 'nullable|string|max:255',
                'type' => 'required|in:hero_slider,promotional,category_banner,sidebar_banner,footer_banner',
                'position' => 'required|in:top,middle,bottom,left,right,center',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'background_color' => 'nullable|string|max:7',
                'text_color' => 'nullable|string|max:7',
                'text_alignment' => 'required|in:left,center,right',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Handle main image upload
            if ($request->hasFile('image')) {
                // Delete old image
                if ($banner->image_url) {
                    $oldImagePath = str_replace('/storage/', '', $banner->image_url);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }

                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('images/banners', $imageName, 'public');
                $data['image_url'] = '/storage/' . $imagePath;
            }

            // Handle mobile image upload
            if ($request->hasFile('mobile_image')) {
                // Delete old mobile image
                if ($banner->mobile_image_url) {
                    $oldMobileImagePath = str_replace('/storage/', '', $banner->mobile_image_url);
                    if (Storage::disk('public')->exists($oldMobileImagePath)) {
                        Storage::disk('public')->delete($oldMobileImagePath);
                    }
                }

                $mobileImage = $request->file('mobile_image');
                $mobileImageName = time() . '_mobile_' . $mobileImage->getClientOriginalName();
                $mobileImagePath = $mobileImage->storeAs('images/banners', $mobileImageName, 'public');
                $data['mobile_image_url'] = '/storage/' . $mobileImagePath;
            }

            $banner->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Banner updated successfully',
                'data' => $banner
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $banner = Banner::findOrFail($id);

            // Delete associated images
            if ($banner->image_url) {
                $imagePath = str_replace('/storage/', '', $banner->image_url);
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }

            if ($banner->mobile_image_url) {
                $mobileImagePath = str_replace('/storage/', '', $banner->mobile_image_url);
                if (Storage::disk('public')->exists($mobileImagePath)) {
                    Storage::disk('public')->delete($mobileImagePath);
                }
            }

            $banner->delete();

            return response()->json([
                'success' => true,
                'message' => 'Banner deleted successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $banner = Banner::findOrFail($id);
            $banner->update(['is_active' => !$banner->is_active]);

            return response()->json([
                'success' => true,
                'message' => 'Banner status updated successfully',
                'data' => $banner
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update banner status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateSortOrder(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'banners' => 'required|array',
                'banners.*.id' => 'required|exists:banners,id',
                'banners.*.sort_order' => 'required|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            foreach ($request->banners as $bannerData) {
                Banner::where('id', $bannerData['id'])
                    ->update(['sort_order' => $bannerData['sort_order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Banner order updated successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update banner order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}