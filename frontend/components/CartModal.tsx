'use client';

import { X, Plus, Minus, ShoppingBasket } from 'lucide-react';
import { useCartStore, type CartItem } from '@/lib/cartStore';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Price from '@/components/Price';
import SARSymbol from './SARSymbol';

export default function CartModal() {
  const locale = useLocale() as 'en' | 'ar';
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  if (!isOpen) return null;

  const total = getTotalPrice();

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeCart}
      />

      <div className={`fixed top-0 ${locale === 'ar' ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-900">
            <ShoppingBasket className="w-5 h-5" />
            {locale === 'en' ? 'Shopping Cart' : 'سلة التسوق'}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-neutral-50 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBasket className="w-14 h-14 mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-500 text-base">
                {locale === 'en' ? 'Your cart is empty' : 'سلتك فارغة'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: CartItem) => (
                <div key={item.productId} className="flex gap-4 border-b pb-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-neutral-100 rounded overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/80x80/f5f5f5/737373/?text=${encodeURIComponent(item.name.substring(0, 10))}`;
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/products/${item.slug}`}
                      onClick={closeCart}
                      className="font-semibold hover:text-gray-600 transition-colors block truncate"
                    >
                      {item.name}
                    </Link>
                    <p className="text-gray-600 mt-1">
                      <Price amount={item.price} symbolClassName="w-4 h-4" />
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        {locale === 'en' ? 'Remove' : 'إزالة'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-100 p-5 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-lg font-semibold text-neutral-900">
              <span>{locale === 'en' ? 'Total:' : 'المجموع:'}</span>
              <span><SARSymbol />{total.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                href={`/${locale}/cart`}
                onClick={closeCart}
                className="block w-full py-3 bg-primary text-white text-center text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {locale === 'en' ? 'View Cart' : 'عرض السلة'}
              </Link>
              <button
                onClick={closeCart}
                className="block w-full py-3 border border-neutral-200 text-center text-sm font-medium hover:bg-neutral-50 transition-colors text-neutral-700"
              >
                {locale === 'en' ? 'Continue Shopping' : 'متابعة التسوق'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
