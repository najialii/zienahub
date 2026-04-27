'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Flower2, 
  Plus, 
  Minus, 
  MessageCircle, 
  Gift,
  ShoppingBasket,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/types';

interface BouquetItem {
  product: Product;
  quantity: number;
}

export default function CustomBouquetPage() {
  const locale = useLocale() as 'en' | 'ar';
  const isRTL = locale === 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [bouquetItems, setBouquetItems] = useState<BouquetItem[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAll(locale);
        // Filter only flower products (roses, tulips, etc.)
        const flowerProducts = data.filter(p => 
          p.name.toLowerCase().includes('rose') ||
          p.name.toLowerCase().includes('tulip') ||
          p.name.toLowerCase().includes('orchid') ||
          p.name.toLowerCase().includes('flower') ||
          p.name.toLowerCase().includes('bouquet')
        );
        setProducts(flowerProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [locale]);

  const addToBouquet = (product: Product) => {
    setBouquetItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromBouquet = (productId: number) => {
    setBouquetItems(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.product.id !== productId);
    });
  };

  const getTotalPrice = () => {
    return bouquetItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return bouquetItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* <Header /> */}
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              {locale === 'en' ? 'Custom Bouquet Builder' : 'منشئ الباقات المخصصة'}
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {locale === 'en'
                ? 'Select your favorite flowers to create the perfect bouquet'
                : 'اختر أزهارك المفضلة لإنشاء الباقة المثالية'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Product Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                  {locale === 'en' ? 'Choose Your Flowers' : 'اختر أزهارك'}
                </h2>

                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-neutral-200 rounded-lg h-48 mb-3"></div>
                        <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                        <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map((product) => {
                      const inBouquet = bouquetItems.find(item => item.product.id === product.id);
                      return (
                        <div key={product.id} className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors">
                          <div className="aspect-square bg-neutral-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Flower2 className="w-12 h-12 text-neutral-400" />
                            )}
                          </div>
                          
                          <h3 className="font-medium text-neutral-900 mb-1 text-sm">
                            {product.name}
                          </h3>
                          
                          <p className="text-sm text-neutral-600 mb-3">
                            {product.price} {locale === 'en' ? 'SAR' : 'ريال'}
                          </p>

                          <div className="flex items-center justify-between">
                            {inBouquet ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => removeFromBouquet(product.id)}
                                  className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-medium text-neutral-900 min-w-[20px] text-center">
                                  {inBouquet.quantity}
                                </span>
                                <button
                                  onClick={() => addToBouquet(product)}
                                  className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToBouquet(product)}
                                className="flex items-center gap-2 bg-neutral-900 text-white px-3 py-2 rounded-lg hover:bg-neutral-800 text-sm"
                              >
                                <Plus className="w-4 h-4" />
                                {locale === 'en' ? 'Add' : 'أضف'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Bouquet Preview & Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                  {locale === 'en' ? 'Your Bouquet' : 'باقتك'}
                </h2>

                {/* Bouquet Items */}
                <div className="space-y-3 mb-6">
                  {bouquetItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Flower2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-500 text-sm">
                        {locale === 'en' ? 'No flowers selected yet' : 'لم يتم اختيار أزهار بعد'}
                      </p>
                    </div>
                  ) : (
                    bouquetItems.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                        <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.product.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Flower2 className="w-6 h-6 text-neutral-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-900 text-sm truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-neutral-600">
                            {item.quantity} × {item.product.price} {locale === 'en' ? 'SAR' : 'ريال'}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromBouquet(item.product.id)}
                          className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Card */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    {locale === 'en' ? 'Personal Message (Optional)' : 'رسالة شخصية (اختيارية)'}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={locale === 'en' ? 'Write your heartfelt message...' : 'اكتب رسالتك من القلب...'}
                    className="w-full p-3 border border-neutral-200 rounded-lg resize-none h-20 text-sm"
                    maxLength={200}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {message.length}/200
                  </p>
                </div>

                {/* Summary */}
                {bouquetItems.length > 0 && (
                  <div className="border-t border-neutral-200 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-600">
                        {locale === 'en' ? 'Total Items:' : 'إجمالي العناصر:'}
                      </span>
                      <span className="font-medium">{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-neutral-900">
                        {locale === 'en' ? 'Total:' : 'الإجمالي:'}
                      </span>
                      <span className="text-lg font-bold text-neutral-900">
                        {getTotalPrice().toFixed(2)} {locale === 'en' ? 'SAR' : 'ريال'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  disabled={bouquetItems.length === 0}
                  className="w-full bg-neutral-900 text-white py-3 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBasket className="w-5 h-5" />
                  {locale === 'en' ? 'Add to Cart' : 'أضف للسلة'}
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}