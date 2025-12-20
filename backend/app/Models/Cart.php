<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'product_name',
        'product_slug',
        'product_price',
        'product_image_url',
        'product_sku',
        'quantity',
    ];

    protected $casts = [
        'product_price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    /**
     * Get the user that owns the cart item
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product associated with the cart item
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the total price for this cart item
     */
    public function getTotalPriceAttribute(): float
    {
        return $this->product_price * $this->quantity;
    }

    /**
     * Scope to get cart items for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get cart summary for a user
     */
    public static function getCartSummary($userId)
    {
        $cartItems = static::forUser($userId)->get();
        
        return [
            'items' => $cartItems,
            'total_items' => $cartItems->sum('quantity'),
            'total_amount' => $cartItems->sum(function ($item) {
                return $item->product_price * $item->quantity;
            }),
            'updated_at' => $cartItems->max('updated_at'),
        ];
    }
}