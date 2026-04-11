<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title_en',
        'title_ar',
        'description_en',
        'description_ar',
        'image_url',
        'mobile_image_url',
        'link_url',
        'link_text_en',
        'link_text_ar',
        'type',
        'position',
        'sort_order',
        'is_active',
        'start_date',
        'end_date',
        'background_color',
        'text_color',
        'text_alignment',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'sort_order' => 'integer',
    ];

    
    public function getTitle($locale = 'en')
    {
        return $this->{"title_$locale"} ?? $this->title_en;
    }

   
    public function getDescription($locale = 'en')
    {
        return $this->{"description_$locale"} ?? $this->description_en;
    }

    public function getLinkText($locale = 'en')
    {
        return $this->{"link_text_$locale"} ?? $this->link_text_en;
    }

    /**
     * Scope to get only active banners
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get banners by type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get banners that are currently valid (within date range)
     */
    public function scopeCurrentlyValid($query)
    {
        $now = Carbon::now();
        return $query->where(function ($q) use ($now) {
            $q->where(function ($subQ) use ($now) {
                $subQ->whereNull('start_date')
                     ->orWhere('start_date', '<=', $now);
            })->where(function ($subQ) use ($now) {
                $subQ->whereNull('end_date')
                     ->orWhere('end_date', '>=', $now);
            });
        });
    }

    /**
     * Scope to order by sort order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc');
    }

    /**
     * Check if banner is currently valid
     */
    public function isCurrentlyValid()
    {
        $now = Carbon::now();
        
        $startValid = !$this->start_date || $this->start_date <= $now;
        $endValid = !$this->end_date || $this->end_date >= $now;
        
        return $startValid && $endValid;
    }
}
