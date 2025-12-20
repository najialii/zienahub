<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'delivery_person_id',
        'status',
        'message',
        'telegram_message_id',
        'sent_at',
        'responded_at',
        'expires_at',
        'decline_reason'
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'responded_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the order associated with this notification.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the delivery person associated with this notification.
     */
    public function deliveryPerson()
    {
        return $this->belongsTo(DeliveryPerson::class);
    }

    /**
     * Scope for pending notifications.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for accepted notifications.
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope for declined notifications.
     */
    public function scopeDeclined($query)
    {
        return $query->where('status', 'declined');
    }

    /**
     * Scope for expired notifications.
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
                    ->orWhere(function($q) {
                        $q->where('status', 'pending')
                          ->where('expires_at', '<', now());
                    });
    }

    /**
     * Check if the notification has expired.
     */
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Mark notification as accepted.
     */
    public function accept()
    {
        $this->update([
            'status' => 'accepted',
            'responded_at' => now()
        ]);
    }

    /**
     * Mark notification as declined.
     */
    public function decline($reason = null)
    {
        $this->update([
            'status' => 'declined',
            'responded_at' => now(),
            'decline_reason' => $reason
        ]);
    }

    /**
     * Mark notification as expired.
     */
    public function expire()
    {
        $this->update([
            'status' => 'expired'
        ]);
    }
}