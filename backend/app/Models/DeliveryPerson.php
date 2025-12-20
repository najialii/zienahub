<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryPerson extends Model
{
    use HasFactory;

    protected $table = 'delivery_personnel';

    protected $fillable = [
        'name',
        'phone',
        'telegram_chat_id',
        'telegram_username',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the orders assigned to this delivery person.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'delivery_person_id');
    }

    /**
     * Get active delivery personnel.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the count of pending orders for this delivery person.
     */
    public function getPendingOrdersCountAttribute()
    {
        return $this->orders()->whereIn('status', ['pending', 'processing', 'assigned'])->count();
    }
}