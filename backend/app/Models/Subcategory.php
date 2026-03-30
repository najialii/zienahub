<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subcategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'slug',
        'is_featured',
        'featured_sort_order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_featured' => 'boolean',
    ];

    /**
     * Get the category that owns the subcategory.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the products for this subcategory.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }


  
    
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the translations for this subcategory.
     */
    public function translations(): HasMany
    {
        return $this->hasMany(SubcategoryTranslation::class);
    }

    /**
     * Get translation for specific locale
     */
    public function translate($locale = 'en')
    {
        // Use loaded relationship if available to avoid N+1 queries
        if ($this->relationLoaded('translations')) {
            return $this->translations->where('locale', $locale)->first();
        }
        return $this->translations()->where('locale', $locale)->first();
    }

    /**
     * Get name for specific locale
     */
    public function getName($locale = 'en')
    {
        $translation = $this->translate($locale);
        return $translation ? $translation->name : '';
    }

    /**
     * Get description for specific locale
     */
    public function getDescription($locale = 'en')
    {
        $translation = $this->translate($locale);
        return $translation ? $translation->description : '';
    }

    /**
     * Scope to get only featured subcategories
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to order by featured sort order
     */
    public function scopeOrderedByFeatured($query)
    {
        return $query->orderBy('featured_sort_order', 'asc')->orderBy('created_at', 'desc');
    }

    /**
     * Get products from this subcategory with limit
     */
    public function getFeaturedProducts($limit = 4)
    {
        return $this->products()
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
