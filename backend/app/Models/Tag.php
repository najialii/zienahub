<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_ar',
        'slug',
        'description_en',
        'description_ar',
        'type', // e.g., 'promotion', 'brand', 'category'
        'color',
        'icon',
        'image_url',
        'sort_order',
        'is_active',
        'is_featured',
        // NEW: Promotion Fields
        'discount_percentage', 
        'valid_until',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'discount_percentage' => 'integer',
        'valid_until' => 'datetime',
    ];

    protected $appends = ['is_expired'];

    /**
     * NICEONE LOGIC: Check if a promotion tag is still valid
     */
    public function getIsExpiredAttribute(): bool
    {
        if (!$this->valid_until) return false;
        return $this->valid_until->isPast();
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES for CMS
    |--------------------------------------------------------------------------
    */

    /**
     * Get only active tags
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Order tags by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
    }

    /**
     * Get only featured tags
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Get tags by type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get only active promotions that haven't expired
     */
    public function scopeActivePromotions($query)
    {
        return $query->where('type', 'promotion')
                     ->where('is_active', true)
                     ->where(function ($q) {
                         $q->whereNull('valid_until')
                           ->orWhere('valid_until', '>', now());
                     });
    }

    // ... (Keep your existing Name/Description attributes and boot methods)

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}