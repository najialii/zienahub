<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Get featured tags for homepage.
     */
    public function featured()
    {
        try {
            $tags = Tag::active()
                ->featured()
                ->ordered()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tags
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching featured tags: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get all active tags.
     */
    public function index()
    {
        try {
            $tags = Tag::active()
                ->ordered()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tags
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
     * Get tags by type.
     */
    public function byType($type)
    {
        try {
            $tags = Tag::active()
                ->ofType($type)
                ->ordered()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tags
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching tags by type: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
}