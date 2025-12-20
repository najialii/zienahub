<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $locale = $request->header('Accept-Language', 'en');
        $type = $request->get('type');
        $position = $request->get('position');

        $query = Banner::active()->currentlyValid()->ordered();

        if ($type) {
            $query->ofType($type);
        }

        if ($position) {
            $query->where('position', $position);
        }

        $banners = $query->get()->map(function ($banner) use ($locale) {
            return [
                'id' => $banner->id,
                'title' => $banner->getTitle($locale),
                'description' => $banner->getDescription($locale),
                'image_url' => $banner->image_url ? url($banner->image_url) : null,
                'mobile_image_url' => $banner->mobile_image_url ? url($banner->mobile_image_url) : null,
                'link_url' => $banner->link_url,
                'link_text' => $banner->getLinkText($locale),
                'type' => $banner->type,
                'position' => $banner->position,
                'background_color' => $banner->background_color,
                'text_color' => $banner->text_color,
                'text_alignment' => $banner->text_alignment,
                'sort_order' => $banner->sort_order,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $banners
        ]);
    }

    public function getByType(Request $request, $type)
    {
        $locale = $request->header('Accept-Language', 'en');
        $position = $request->get('position');

        $query = Banner::active()->currentlyValid()->ofType($type)->ordered();

        if ($position) {
            $query->where('position', $position);
        }

        $banners = $query->get()->map(function ($banner) use ($locale) {
            return [
                'id' => $banner->id,
                'title' => $banner->getTitle($locale),
                'description' => $banner->getDescription($locale),
                'image_url' => $banner->image_url ? url($banner->image_url) : null,
                'mobile_image_url' => $banner->mobile_image_url ? url($banner->mobile_image_url) : null,
                'link_url' => $banner->link_url,
                'link_text' => $banner->getLinkText($locale),
                'type' => $banner->type,
                'position' => $banner->position,
                'background_color' => $banner->background_color,
                'text_color' => $banner->text_color,
                'text_alignment' => $banner->text_alignment,
                'sort_order' => $banner->sort_order,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $banners
        ]);
    }
}