<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'minimum_amount',
        'maximum_discount',
        'usage_limit',
        'usage_count',
        'usage_limit_per_user',
        'starts_at',
        'expires_at',
        'is_active',
        'auto_apply',
        'applicable_products',
        'applicable_categories'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'auto_apply' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'applicable_products' => 'array',
        'applicable_categories' => 'array',
        'value' => 'decimal:2',
        'minimum_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2'
    ];

    /**
     * Get promo code usages
     */
    public function usages()
    {
        return $this->hasMany(PromoCodeUsage::class);
    } 

    /**
     * Get orders that used this promo code
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Scope for active promo codes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for auto-apply promo codes
     */
    public function scopeAutoApply($query)
    {
        return $query->where('auto_apply', true);
    }

    /**
     * Scope for valid promo codes (not expired, within date range)
     */
    public function scopeValid($query)
    {
        $now = Carbon::now();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
            });
    }

    /**
     * Check if promo code is valid
     */
    public function isValid()
    {
        $now = Carbon::now();
        
        // Check if active
        if (!$this->is_active) {
            return false;
        }
        
        // Check start date
        if ($this->starts_at && $this->starts_at->gt($now)) {
            return false;
        }
        
        // Check expiry date
        if ($this->expires_at && $this->expires_at->lt($now)) {
            return false;
        }
        
        // Check usage limit
        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }
        
        return true;
    }

    /**
     * Check if user can use this promo code
     */
    public function canBeUsedBy($userId = null, $userEmail = null)
    {
        if (!$this->isValid()) {
            return false;
        }
        
        // Check per-user usage limit
        if ($this->usage_limit_per_user) {
            $userUsageCount = $this->usages()
                ->where(function ($query) use ($userId, $userEmail) {
                    if ($userId) {
                        $query->where('user_id', $userId);
                    }
                    if ($userEmail) {
                        $query->orWhere('user_email', $userEmail);
                    }
                })
                ->count();
                
            if ($userUsageCount >= $this->usage_limit_per_user) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Calculate discount for given amount and items
     */
    public function calculateDiscount($subtotal, $items = [])
    {
        if (!$this->isValid()) {
            return 0;
        }
        
        // Check minimum amount
        if ($this->minimum_amount && $subtotal < $this->minimum_amount) {
            return 0;
        }
        
        // Check applicable products/categories
        if ($this->applicable_products || $this->applicable_categories) {
            $applicableAmount = $this->getApplicableAmount($items);
            if ($applicableAmount == 0) {
                return 0;
            }
            $subtotal = $applicableAmount;
        }
        
        $discount = 0;
        
        if ($this->type === 'percentage') {
            $discount = ($subtotal * $this->value) / 100;
            
            // Apply maximum discount limit
            if ($this->maximum_discount && $discount > $this->maximum_discount) {
                $discount = $this->maximum_discount;
            }
        } else {
            // Fixed amount
            $discount = min($this->value, $subtotal);
        }
        
        return round($discount, 2);
    }

    /**
     * Get applicable amount for specific products/categories
     */
    private function getApplicableAmount($items)
    {
        $applicableAmount = 0;
        
        foreach ($items as $item) {
            $isApplicable = false;
            
            // Check if product is in applicable products
            if ($this->applicable_products && in_array($item['product_id'], $this->applicable_products)) {
                $isApplicable = true;
            }
            
            // Check if product category is in applicable categories
            if ($this->applicable_categories && isset($item['category_id']) && in_array($item['category_id'], $this->applicable_categories)) {
                $isApplicable = true;
            }
            
            if ($isApplicable) {
                $applicableAmount += $item['price'] * $item['quantity'];
            }
        }
        
        return $applicableAmount;
    }

    /**
     * Use this promo code
     */
    public function use($orderId, $userId = null, $userEmail = null, $discountAmount = 0)
    {
        // Increment usage count
        $this->increment('usage_count');
        
        // Create usage record
        PromoCodeUsage::create([
            'promo_code_id' => $this->id,
            'order_id' => $orderId,
            'user_id' => $userId,
            'user_email' => $userEmail,
            'discount_amount' => $discountAmount
        ]);
    }
}