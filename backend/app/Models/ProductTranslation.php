<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductTranslation extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'locale',
        'name',
        'description',
        'how_to_use',
        'ingredients',
        'benefits',
    ];

    /**
     * Get the product that owns the translation.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
