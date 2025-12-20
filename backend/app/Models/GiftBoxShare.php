<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class GiftBoxShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'gift_box_id',
        'user_id',
        'share_token',
        'recipient_name',
        'recipient_email',
        'recipient_phone',
        'access_count',
        'expires_at',
    ];

    protected $casts = [
        'access_count' => 'integer',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the gift box that is being shared.
     */
    public function giftBox(): BelongsTo
    {
        return $this->belongsTo(GiftBox::class);
    }

    /**
     * Get the user who created the share.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a unique share token.
     */
    public static function generateToken(): string
    {
        do {
            $token = Str::random(32);
        } while (self::where('share_token', $token)->exists());

        return $token;
    }

    /**
     * Increment the access count for this share.
     */
    public function incrementAccessCount(): void
    {
        $this->increment('access_count');
    }

    /**
     * Check if the share link has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Scope to get only non-expired shares.
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }
}
