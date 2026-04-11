<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [ 
        'slug',
        'image_url',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function translations(): HasMany
    {
        return $this->hasMany(CategoryTranslation::class);
    }

     
   

    /**
     * Get the subcategories for this category.
     */
    public function subcategories(): HasMany
    {
        return $this->hasMany(Subcategory::class);
    }

  
    public function products()
    {
        return $this->hasManyThrough(Product::class, Subcategory::class);
    }

     
   


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
     * 
     * Get description for specific locale
     */
    public function getDescription($locale = 'en')
    {
        $translation = $this->translate($locale);
        return $translation ? $translation->description : '';
    }
}
