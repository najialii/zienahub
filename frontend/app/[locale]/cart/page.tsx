'use client';

import { useLocale } from 'next-intl';
import { ShoppingBasket, Trash2, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Price from '@/components/Price';
import { useCartStore, type CartItem } from '@/lib/cartStore';
import Link from 'next/link';

export default function CartPage() {
  const locale = useLocale() as 'en' | 'ar';
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  
  const total = getTotalPrice();
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      
      <main className="flex-1 py-8 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {locale === 'en' ? 'Shopping Cart' : 'سلة التسوق'}
            </h1>
            {!isEmpty && (
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 font-medium transition-colors text-sm sm:text-base self-start sm:self-auto"
              >
                {locale === 'en' ? 'Clear Cart' : 'إفراغ السلة'}
              </button>
            )}
          </div>

          {isEmpty ? (
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 md:p-12 text-center rounded-lg">
              <ShoppingBasket className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-neutral-400" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                {locale === 'en' ? 'Your cart is empty' : 'سلتك فارغة'}
              </h2>
              <p className="text-neutral-600 mb-6 text-sm sm:text-base">
                {locale === 'en' 
                  ? 'Add some products to get started'
                  : 'أضف بعض المنتجات للبدء'}
              </p>
              <Link
                href={`/${locale}/products`}
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white hover:bg-primary-dark transition-all font-medium rounded text-sm sm:text-base"
              >
                {locale === 'en' ? 'Continue Shopping' : 'متابعة التسوق'}
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item: CartItem) => (
                  <div key={item.id} className="bg-white border border-neutral-200 p-4 sm:p-6 rounded-lg">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Product Image */}
                      <div className="relative w-full sm:w-24 md:w-32 h-32 sm:h-24 md:h-32 flex-shrink-0 bg-neutral-100 rounded overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/128x128/f5f5f5/737373/?text=${encodeURIComponent(item.name.substring(0, 10))}`;
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/${locale}/products/${item.slug}`}
                              className="text-lg sm:text-xl font-semibold hover:text-gray-600 transition-colors block truncate"
                            >
                              {item.name}
                            </Link>
                            {item.sku && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                SKU: {item.sku}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 sm:p-2 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        <p className="text-lg sm:text-2xl font-bold mb-4">
                          <Price amount={item.price} className="text-lg sm:text-2xl font-bold" />
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <span className="text-gray-600 font-medium text-sm sm:text-base">
                            {locale === 'en' ? 'Quantity:' : 'الكمية:'}
                          </span>
                          <div className="flex items-center justify-between sm:justify-start gap-2">
                            <div className="flex items-center gap-1 sm:gap-2 border border-gray-300 rounded">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="w-8 sm:w-12 text-center font-semibold text-sm sm:text-base">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            <span className="text-lg sm:text-xl font-bold">
                              <Price amount={item.price * item.quantity} className="text-lg sm:text-xl font-bold" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-neutral-200 p-4 sm:p-6 rounded-lg lg:sticky lg:top-24">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                    {locale === 'en' ? 'Order Summary' : 'ملخص الطلب'}
                  </h2>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                      <span>{locale === 'en' ? 'Subtotal' : 'المجموع الفرعي'}</span>
                      <Price amount={total} />
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                      <span>{locale === 'en' ? 'Shipping' : 'الشحن'}</span>
                      <span className="text-xs sm:text-sm text-right">
                        {locale === 'en' ? 'Calculated at checkout' : 'يحسب عند الدفع'}
                      </span>
                    </div>
                    <div className="border-t pt-3 sm:pt-4 flex justify-between text-lg sm:text-2xl font-bold">
                      <span>{locale === 'en' ? 'Total' : 'المجموع'}</span>
                      <Price amount={total} className="text-lg sm:text-2xl font-bold" />
                    </div>
                  </div>

                  <Link
                    href={`/${locale}/checkout`}
                    className="block w-full py-3 sm:py-4 bg-primary text-white text-center font-medium hover:bg-primary-dark transition-colors mb-3 rounded text-sm sm:text-base"
                  >
                    {locale === 'en' ? 'Proceed to Checkout' : 'متابعة إلى الدفع'}
                  </Link>

                  <Link
                    href={`/${locale}/products`}
                    className="block w-full py-3 sm:py-4 border border-neutral-300 text-center font-medium hover:bg-neutral-50 transition-colors rounded text-sm sm:text-base"
                  >
                    {locale === 'en' ? 'Continue Shopping' : 'متابعة التسوق'}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
