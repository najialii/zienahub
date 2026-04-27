<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = ["country_code", "cunconde", "name_en", "name_ar", "symbol", "exchange_rate"];
}
