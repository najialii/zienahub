'use client';

import Link from 'next/link';
import { ShoppingBasket, Heart, Plus, Minus, Star } from 'lucide-react';
import { useState } from 'react';
import Price from '@/components/Price';
import { useCartStore } from '@/lib/cartStore';
import { useWishlistStore } from '@/lib/wishlistStore';
import { getPlaceholderImageUrl } from '@/lib/imageUtils';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  locale: 'en' | 'ar';
  translations?: {
    inStock: string;
    outOfStock: string;
    addToCart: string;
  };
  size?: 'small' | 'medium' | 'large';
  showRating?: boolean;
}

export default function ProductCard({ 
  product, 
  locale, 
  size = 'medium',
  showRating = false 
}: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Check if product is in cart
  const cartItem = items.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'rounded-lg',
      image: 'aspect-[3/4]',
      padding: 'p-2 sm:p-3',
      title: 'text-xs sm:text-sm',
      price: 'text-sm sm:text-base',
      button: 'px-2 py-1 text-xs',
      heart: 'w-6 h-6 sm:w-8 sm:h-8',
      heartIcon: 'w-3 h-3 sm:w-4 sm:h-4'
    },
    medium: {
      container: 'rounded-xl',
      image: 'aspect-[3/4]',
      padding: 'p-3 sm:p-4',
      title: 'text-sm sm:text-base',
      price: 'text-base sm:text-lg',
      button: 'px-3 py-1.5 text-sm',
      heart: 'w-8 h-8 sm:w-10 sm:h-10',
      heartIcon: 'w-4 h-4 sm:w-5 sm:h-5'
    },
    large: {
      container: 'rounded-2xl',
      image: 'aspect-[3/4]',
      padding: 'p-4 sm:p-6',
      title: 'text-base sm:text-lg',
      price: 'text-lg sm:text-xl',
      button: 'px-4 py-2 text-base',
      heart: 'w-10 h-10 sm:w-12 sm:h-12',
      heartIcon: 'w-5 h-5 sm:w-6 sm:h-6'
    }
  };

  const config = sizeConfig[size];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity === 0) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
      sku: product.sku,
      quantity: 1,
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (cartItem && quantityInCart < product.stock_quantity) {
      updateQuantity(cartItem.productId, quantityInCart + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (cartItem) {
      if (quantityInCart > 1) {
        updateQuantity(cartItem.productId, quantityInCart - 1);
      } else {
        updateQuantity(cartItem.productId, 0);
      }
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
    });

    // Trigger heart animation
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 500);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = getPlaceholderImageUrl(product.name);
    setImageLoading(false);
  };

  // Mock rating for demo (you can replace with actual rating from product data)
  const rating = 4.5;
  const reviewCount = 23;

  return (
    <div className="group w-full">
      <Link href={`/${locale}/products/${product.slug}`}>
        <div className={`bg-white hover:shadow-xl transition-all duration-300 ${config.container} overflow-hidden border border-neutral-100 hover:border-neutral-200 relative`}>
          
          {/* Stock Badge */}
          {product.stock_quantity === 0 && (
            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {locale === 'en' ? 'Out of Stock' : 'غير متوفر'}
            </div>
          )}

          {/* Sale Badge - if you have sale price */}
          {product.sale_price && (
            <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {locale === 'en' ? 'Sale' : 'تخفيض'}
            </div>
          )}

          {/* Product Image */}
          <div className={`relative ${config.image} overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100`}>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
              </div>
            )}
            
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Wishlist Button - Top Right */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-3 right-3 ${config.heart} rounded-full flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-sm ${
                inWishlist 
                  ? 'bg-red-500 text-white scale-110' 
                  : 'bg-white/90 text-neutral-600 hover:bg-red-50 hover:text-red-500 hover:scale-110'
              }`}
              title={locale === 'en' ? 'Add to wishlist' : 'أضف للمفضلة'}
            >
              <Heart 
                className={`${config.heartIcon} ${inWishlist ? 'fill-current' : ''} ${isHeartAnimating ? 'animate-heart-beat' : ''}`} 
              />
            </button>

            {/* Quick Add to Cart on Hover - Desktop Only */}
            <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden sm:block">
              {quantityInCart > 0 ? (
                <div className="flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <button
                    onClick={handleDecrement}
                    className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-neutral-900 min-w-[24px] text-center">
                    {quantityInCart}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantityInCart >= product.stock_quantity}
                    className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-full font-medium transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBasket className="w-4 h-4" />
                  {locale === 'en' ? 'Quick Add' : 'إضافة سريعة'}
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className={`${config.padding} bg-white`}>
            {/* Rating */}
            {showRating && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(rating)
                          ? 'text-yellow-400 fill-current'
                          : i < rating
                          ? 'text-yellow-400 fill-current opacity-50'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-500">({reviewCount})</span>
              </div>
            )}

            {/* Product Name */}
            <h3 className={`${config.title} font-medium text-neutral-800 mb-3 line-clamp-2 group-hover:text-neutral-900 transition-colors leading-tight`}>
              {product.name}
            </h3>
            
            {/* Price and Mobile Actions */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className={`${config.price} font-bold text-neutral-900`}>
                  <Price amount={product.price} symbolClassName="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                {product.sale_price && (
                  <div className="text-xs text-neutral-500 line-through">
                    <Price amount={product.sale_price} symbolClassName="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              {/* Mobile Add to Cart / Quantity Controls */}
              <div className="sm:hidden">
                {quantityInCart > 0 ? (
                  <div className="flex items-center gap-1 bg-neutral-900 text-white rounded-full px-2 py-1">
                    <button
                      onClick={handleDecrement}
                      className="hover:bg-neutral-700 rounded-full p-0.5 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold min-w-[20px] text-center">
                      {quantityInCart}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantityInCart >= product.stock_quantity}
                      className="hover:bg-neutral-700 rounded-full p-0.5 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex items-center justify-center w-8 h-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBasket className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Stock Status */}
            {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
              <div className="mt-2 text-xs text-orange-600 font-medium">
                {locale === 'en' ? `Only ${product.stock_quantity} left` : `${product.stock_quantity} فقط متبقي`}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
