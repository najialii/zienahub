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
        'subscription_plan',
        'subscription_status',
        'monthly_price',
        'max_users',
        'max_products',
        'subscription_starts_at',
        'subscription_ends_at',
        'is_active',
    ];

    protected $casts = [
        'monthly_price' => 'decimal:2',
        'max_users' => 'integer',
        'max_products' => 'integer',
        'subscription_starts_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'is_active' => 'boolean',
    ];

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

}
