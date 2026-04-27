<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class AuthController extends Controller
{
 
    public function register(Request $request)
    {
        $validated = $request->validate([
            'phone'        => 'required|string|max:20|unique:users,phone',
            'password'     => 'required|string|min:8|confirmed',
            'account_type' => 'required|in:customer,seller',
            'store_name'   => 'required_if:account_type,seller|string|max:255|nullable',
        ]);

        $role = $validated['account_type'] === 'seller' ? 'tenant_admin' : 'customer';
        $tenantId = null;

        if ($validated['account_type'] === 'seller') {
            $storeName = $validated['store_name'];
            $tenant = \App\Models\Tenant::create([
                'name'                => $storeName,
                'slug'                => \Illuminate\Support\Str::slug($storeName) . '-' . \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(4)),
                'is_active'           => false,
                'verification_status' => 'pending',
                'subscription_plan'   => 'starter',
                'subscription_status' => 'trial',
            ]);
            $tenantId = $tenant->id;
        }

        $user = User::create([
            'name'              => null,
            'email'             => null,
            'phone'             => $validated['phone'],
            'password'          => Hash::make($validated['password']),
            'role'              => $role,
            'account_type'      => $validated['account_type'],
            'profile_completed' => false,
            'tenant_id'         => $tenantId,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        $responseUser = [
            'id'                  => $user->id,
            'name'                => $user->name,
            'email'               => $user->email,
            'phone'               => $user->phone,
            'role'                => $user->role,
            'account_type'        => $user->account_type,
            'profile_completed'   => $user->profile_completed,
            'tenant_id'           => $user->tenant_id,
        ];

        if ($tenantId) {
            $responseUser['tenant_verification_status'] = 'pending';
        }

        return response()->json([
            'success' => true,
            'message' => $validated['account_type'] === 'seller'
                ? 'Store registered. Awaiting admin verification.'
                : 'User registered successfully',
            'data' => [
                'user'  => $responseUser,
                'token' => $token,
            ],
        ], 201);
    }

    public function completeProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'profile_completed' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile completed successfully',
            'data' => [
                'user' => [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'email'             => $user->email,
                    'phone'             => $user->phone,
                    'role'              => $user->role,
                    'account_type'      => $user->account_type,
                    'profile_completed' => $user->profile_completed,
                    'tenant_id'         => $user->tenant_id,
                ],
            ],
        ]);
    }

    
    public function login(Request $request)
    {
        $validated = $request->validate([
            'phone'    => 'required_without:email|string|nullable',
            'email'    => 'required_without:phone|email|nullable',
            'password' => 'required',
        ]);

        $user = isset($validated['phone']) && $validated['phone']
            ? User::where('phone', $validated['phone'])->first()
            : User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        $responseUser = [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'phone'             => $user->phone,
            'role'              => $user->role,
            'account_type'      => $user->account_type,
            'profile_completed' => $user->profile_completed,
            'tenant_id'         => $user->tenant_id,
        ];

        if ($user->tenant_id) {
            $tenant = \App\Models\Tenant::find($user->tenant_id);
            if ($tenant) {
                $responseUser['tenant_verification_status'] = $tenant->verification_status;
                $responseUser['tenant_is_active'] = $tenant->is_active;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user'  => $responseUser,
                'token' => $token,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'tenant_id' => $request->user()->tenant_id,
                ],
            ],
        ]);
    }

    
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
                'errors' => [
                    'current_password' => ['The current password is incorrect.']
                ]
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        $currentToken = $request->user()->currentAccessToken();
        $user->tokens()->where('id', '!=', $currentToken->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

   
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make(Str::random(24)), 
                    'role' => 'customer',
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                if (!$user->google_id) {
                    $user->google_id = $googleUser->getId();
                }
                if (!$user->avatar) {
                    $user->avatar = $googleUser->getAvatar();
                }
                $user->save();
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect()->away("{$frontendUrl}/auth/callback?token={$token}");

        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect()->away("{$frontendUrl}/login?error=google_auth_failed");
        }
    }

    public function profile(Request $request)
    {
        $user = $request->user();

        $totalOrders = $user->orders()->count();
        $totalSpent = $user->orders()->where('status', '!=', 'cancelled')->sum('total_amount');
        $wishlistItems = $user->wishlists()->count();

        $recentOrders = $user->orders()
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'date' => $order->created_at->format('M d, Y'),
                    'amount' => $order->total_amount,
                    'status' => $order->status,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'tenant_id' => $user->tenant_id,
                    'avatar' => $user->avatar,
                    'member_since' => $user->created_at->format('F Y'),
                ],
                'stats' => [
                    'total_orders' => $totalOrders,
                    'total_spent' => (float) $totalSpent,
                    'wishlist_items' => $wishlistItems,
                ],
                'recent_orders' => $recentOrders,
            ],
        ]);
    }
}
