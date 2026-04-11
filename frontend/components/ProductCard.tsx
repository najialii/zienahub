'use client';

import Link from 'next/link';
import { Heart, Plus, Minus, Star, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import Price from '@/components/Price';
import { useCartStore } from '@/lib/cartStore';
import { useWishlistStore } from '@/lib/wishlistStore';
import { getPlaceholderImageUrl } from '@/lib/imageUtils';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  locale: 'en' | 'ar';
}

export default function ProductCard({ 
  product, 
  locale 
}: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const cartItem = items.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
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
    e.preventDefault(); e.stopPropagation();
    updateQuantity(product.id, quantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    updateQuantity(product.id, Math.max(0, quantityInCart - 1));
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    toggleItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
    });
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 500);
  };

  const discountPercentage = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : null;

  const currentPrice = product.sale_price ? product.sale_price : product.price;

  return (
    <div className="group flex flex-col gap-3 w-full bg-white transition-all duration-300 rounded-md  ">
      <Link href={`/${locale}/products/${product.slug}`} className="block">
        
        <div className="relative aspect-[3/4] bg-[#f8f8f8] rounded-xl mb-3">
          
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 start-3 z-20 text-neutral-400 hover:text-[#E42E59] transition-colors"
          >
            <Heart 
              className={`w-[22px] h-[22px] stroke-[1.5] ${inWishlist ? 'fill-[#E42E59] text-[#E42E59]' : ''} ${isHeartAnimating ? 'scale-125' : ''} transition-transform`} 
            />
          </button>

          <div className="absolute bottom-3 end-3 z-20">
            {quantityInCart > 0 ? (
              <div className="flex items-center gap-3 bg-white shadow-lg rounded-full px-2 py-1.5 border border-neutral-100">
                <button onClick={handleIncrement} className="p-1 hover:bg-neutral-50 rounded-full">
                  <Plus className="w-3.5 h-3.5 text-neutral-600"/>
                </button>
                <span className="text-xs font-bold min-w-[12px] text-center">{quantityInCart}</span>
                <button onClick={handleDecrement} className="p-1 hover:bg-neutral-50 rounded-full">
                  <Minus className="w-3.5 h-3.5 text-neutral-600"/>
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="w-10 h-10 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-neutral-100 rounded-full flex items-center justify-center text-neutral-700 hover:text-black transition-transform active:scale-95 disabled:opacity-50"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
                  {/* Tiny plus icon overlaid on the bag */}
                  <div className="absolute -bottom-0.5 -start-1 bg-white rounded-full p-[1px]">
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
              </button>
            )}
          </div>

          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => { e.currentTarget.src = getPlaceholderImageUrl(product.name); }}
          />
        </div>

        <div className="flex flex-col text-start p-2 ">
          
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[11px] text-neutral-400 font-medium tracking-tight">(426)</span>
            <div className="flex items-center gap-0.5 text-[#FFB800]">
              <span className="text-xs font-bold text-neutral-700">5.0</span>
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <p className="text-xs font-bold text-neutral-500 mb-1">
            {product.category?.name}
          </p>

          <h3 className="text-[13px] font-semibold text-neutral-800 line-clamp-2 min-h-[38px] leading-[1.4] mb-3">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 flex-wrap mt-auto">
            {discountPercentage && (
              <span className="bg-[#FFE5EC] text-[#E42E59] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] leading-none">
                {locale === 'en' ? `-${discountPercentage}%` : `${discountPercentage}%-`}
              </span>
            )}

            <div className="text-[17px] font-black text-primary leading-none flex items-baseline gap-1">
              <Price amount={currentPrice} />
            </div>

            {product.sale_price && (
              <span className="text-xs text-neutral-400 font-medium line-through decoration-neutral-300 leading-none">
                <Price amount={product.price} />
              </span>
            )}
          </div>

        </div>
      </Link>
    </div>
  );
}