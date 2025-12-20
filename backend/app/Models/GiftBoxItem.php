<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiftBoxItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'gift_box_id',
        'product_id',
        'quantity',
        'price_at_addition',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price_at_addition' => 'decimal:2',
    ];

    public function giftBox()
    {
        return $this->belongsTo(GiftBox::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
