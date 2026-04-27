<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_ar',
        'code',
        'flag_url',
        'phone_code',
        'currency_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['name'];

    /**
     * Get the translated name based on current locale.
     */
    // public function getNameAttribute(): string
    // {
    //     return app()->getLocale() === 'ar' ? $this->name_ar : $this->name_en;
    // }

    // /**
    //  * Get the currency associated with the country.
    //  */
    // public function currency(): BelongsTo
    // {
    //     return $this->belongsTo(Currency::class);
    // }

    // /**
    //  * Get the banners assigned to this country.
    //  */
    // public function banners(): HasMany
    // {
    //     return $this->hasMany(Banner::class, 'country_code', 'code');
    // }

    // /**
    //  * Get home sections specific to this country.
    //  */
    // public function homeSections(): HasMany
    // {
    //     return $this->hasMany(HomeSection::class);
    // }

    // /**
    //  * Scope to only include active countries.
    //  */
    // public function scopeActive($query)
    // {
    //     return $query->where('is_active', true);
    // }
}