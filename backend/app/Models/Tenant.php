<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'monthly_fee',
        'pricing_tier_id',
        'phone_number',
        'logo',
        'cover_image',
        'description',
        'address',
        'is_active',
        'verification_status',
        'rejection_reason',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'monthly_fee' => 'decimal:2',
    ];

    protected $appends = ['effective_monthly_fee'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
    
    public function subscription(): HasMany
    {
        return $this->hasOne(Subscription::class);
    }

    public function pricingTier()
    {
        return $this->belongsTo(PricingTier::class);
    }

    // Get the effective monthly fee (from tier or custom)
    public function getEffectiveMonthlyFeeAttribute()
    {
        if ($this->pricing_tier_id && $this->relationLoaded('pricingTier') && $this->pricingTier) {
            return (float) $this->pricingTier->monthly_fee;
        }
        return (float) ($this->monthly_fee ?? 0);
    }

}
