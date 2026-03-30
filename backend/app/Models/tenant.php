<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class tenant extends Model
{
    use HasFactory;
        protected $fillable = [
        'name',
        'user_id',
        // 'phone number',
        'slug',
            // 'avatar',
        ];


        // public function users()
        // {
        //     return $this->hasMany(User::class);
        // }

        // public function products()
        // {
        //     return $this->hasMany(Product::class);
        // }

        // public function orders()
        // {
        //     return $this->hasMany(Order::class);
        // }

        // public function categories()
        // {
        //     return $this->hasMany(Category::class);
        // }
}
