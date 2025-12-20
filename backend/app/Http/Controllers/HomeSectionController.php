<?php

namespace App\Http\Controllers;

use App\Models\HomeSection;
use Illuminate\Http\Request;
use Exception;

class HomeSectionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $sections = HomeSection::active()
                ->ordered()
                ->get();

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
}