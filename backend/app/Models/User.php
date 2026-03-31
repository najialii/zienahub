<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Bavix\Wallet\Traits\HasWallet;
use Bavix\Wallet\Interfaces\Wallet;

class User extends Authenticatable implements Wallet
{
    use HasApiTokens, HasFactory, Notifiable, HasWallet;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'tenant_id',
        'google_id',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function giftBoxes()
    {
        return $this->hasMany(GiftBox::class);
    }

    public function giftBoxShares()
    {
        return $this->hasMany(GiftBoxShare::class);
    }

  

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['tenant_admin', 'super_admin', 'admin'], true);
    }

    public function isTenantAdmin(): bool
    {
        return in_array($this->role, ['tenant_admin', 'admin'], true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }
}