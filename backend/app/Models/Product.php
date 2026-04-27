<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'subcategory_id',
        'slug',
        'old_price',
        'price',
        'stock_quantity',
        'image_url',
        'status',
        'brand',
        'size',
        'country_of_origin',
        'tag_id',
        'tenant_id',
    ];

    protected $appends = ['name', 'description', 'how_to_use', 'ingredients', 'benefits', 'sku'];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the translations for the product.
     */
    public function translations(): HasMany
    {
        return $this->hasMany(ProductTranslation::class);
    }

    /**
     * Get the translation for a specific locale.
     */
    public function translation($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        return $this->translations()->where('locale', $locale)->first();
    }

    /**
     * Get the name attribute from translations.
     */
    public function getNameAttribute()
    {
        $translation = $this->translation();
        return $translation ? $translation->name : 'Untitled Product';
    }

    /**
     * Get the description attribute from translations.
     */
    public function getDescriptionAttribute()
    {
        $translation = $this->translation();
        return $translation ? $translation->description : '';
    }

    public function getHowToUseAttribute()
    {
        $translation = $this->translation();
        return $translation ? $translation->how_to_use : '';
    }

    public function getIngredientsAttribute()
    {
        $translation = $this->translation();
        return $translation ? $translation->ingredients : '';
    }

    public function getBenefitsAttribute()
    {
        $translation = $this->translation();
        return $translation ? $translation->benefits : '';
    }

    /**
     * Get the SKU attribute (generated from ID and slug).
     */
    public function getSkuAttribute()
    {
        return 'BLOOM-' . strtoupper(substr($this->slug, 0, 8)) . '-' . str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }



    public function productimg()
    {
        return $this->hasMany(productimg::class);
    }
    
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
    
    /**
     * Get the subcategory that owns the product.
     */
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * Get the cart items for this product.
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get the gift box items for this product.
     */
    public function giftBoxItems(): HasMany
    {
        return $this->hasMany(GiftBoxItem::class);
    }

    /**
     * Get the wishlist entries for this product.
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Get the order items for this product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the tags that belong to this product.
     */
  public function tag(): BelongsTo
{
    // Rename this to 'tag' (cleaner than 'tag_id')
    return $this->belongsTo(Tag::class, 'tag_id');
}

    /**
     * Scope to get only active products.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get products in stock.
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }
}
