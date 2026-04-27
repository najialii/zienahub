'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Plus, Minus, X, ShoppingBasket, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SARSymbol from '@/components/SARSymbol';
import { productsApi } from '@/lib/api';
import { giftBoxApi, type GiftBox as GiftBoxType } from '@/lib/giftBoxApi';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/lib/cartStore';

export default function CustomGiftPage() {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const { addItem } = useCartStore();
  
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [giftBox, setGiftBox] = useState<GiftBoxType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [giftMessage, setGiftMessage] = useState('');

  const categories = [
    { id: 'all', name: locale === 'en' ? 'All Products' : 'جميع المنتجات' },
    { id: 'flowers', name: locale === 'en' ? 'Flowers' : 'ورود' },
    { id: 'chocolates', name: locale === 'en' ? 'Chocolates' : 'شوكولاتة' },
    { id: 'perfumes', name: locale === 'en' ? 'Perfumes' : 'عطور' },
    { id: 'accessories', name: locale === 'en' ? 'Accessories' : 'إكسسوارات' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsData = await productsApi.getAll(locale);
        setProducts(productsData.filter((p: Product) => p.stock_quantity > 0));
        
        // Initialize empty gift box
        setGiftBox({
          id: Date.now(),
          name: 'My Custom Gift Box',
          message: '',
          total_price: 0,
          status: 'active',
          items: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => {
        const categorySlug = typeof p.category === 'object' ? p.category?.slug : '';
        return categorySlug?.includes(selectedCategory);
      });

  const addToGiftBox = (product: Product) => {
    // Simply add to local gift box state (no backend call)
    const existingItem = giftBox?.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Update quantity if already in box
      if (existingItem.quantity < product.stock_quantity) {
        const updatedItems = giftBox!.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        setGiftBox({
          ...giftBox!,
          items: updatedItems,
          total_price: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        });
      }
    } else {
      // Add new item to box
      const newItem = {
        id: Date.now(), // Temporary ID
        quantity: 1,
        price: product.price,
        product: product
      };
      const updatedItems = [...(giftBox?.items || []), newItem];
      setGiftBox({
        id: giftBox?.id || Date.now(),
        name: giftBox?.name || 'My Custom Gift Box',
        message: giftBox?.message || '',
        total_price: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        status: 'active',
        items: updatedItems,
        created_at: giftBox?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  const removeFromGiftBox = (itemId: number) => {
    if (!giftBox) return;
    
    const updatedItems = giftBox.items.filter(item => item.id !== itemId);
    setGiftBox({
      ...giftBox,
      items: updatedItems,
      total_price: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    });
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (!giftBox) return;
    
    if (newQuantity === 0) {
      removeFromGiftBox(itemId);
      return;
    }

    const updatedItems = giftBox.items.map(item => {
      if (item.id === itemId) {
        const maxQty = Math.min(newQuantity, item.product.stock_quantity);
        return { ...item, quantity: maxQty };
      }
      return item;
    });

    setGiftBox({
      ...giftBox,
      items: updatedItems,
      total_price: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    });
  };

  const getTotalPrice = () => {
    return giftBox?.total_price || 0;
  };

  const handleAddToCart = () => {
    if (!giftBox) return;
    
    // Add all items from gift box to cart
    giftBox.items.forEach(item => {
      addItem({
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        image_url: item.product.image_url,
        quantity: item.quantity
      });
    });

    // Redirect to cart
    router.push(`/${locale}/cart`);
  };

  const handleCheckout = () => {
    if (!giftBox) return;
    
    // Add all items to cart and go directly to checkout
    giftBox.items.forEach(item => {
      console.log('Adding gift box item to cart:', {
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity
      });
      
      addItem({
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        image_url: item.product.image_url,
        quantity: item.quantity
      });
    });

    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* <Header /> */}
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'en' ? 'Back' : 'رجوع'}
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-neutral-900" />
              <h1 className="text-3xl md:text-4xl font-medium text-neutral-900">
                {locale === 'en' ? 'Build Your Perfect Gift' : 'صمم هديتك المثالية'}
              </h1>
            </div>
            <p className="text-neutral-600">
              {locale === 'en' 
                ? 'Select products to create a personalized gift box'
                : 'اختر المنتجات لإنشاء صندوق هدايا مخصص'}
            </p>
            

          </div>

          {/* Steps Indicator */}
          <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                step === 1 
                  ? 'bg-neutral-900 text-white' 
                  : 'bg-white text-neutral-600 border border-neutral-200'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
              {locale === 'en' ? 'Select Products' : 'اختر المنتجات'}
            </button>
            
            <button
              onClick={() => giftBox && giftBox.items.length > 0 && setStep(2)}
              disabled={!giftBox || giftBox.items.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                step === 2 
                  ? 'bg-neutral-900 text-white' 
                  : giftBox && giftBox.items.length > 0
                    ? 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
              {locale === 'en' ? 'Review & Personalize' : 'مراجعة وتخصيص'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {step === 1 ? (
                <>
                  {/* Category Filter */}
                  <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedCategory === cat.id
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Products Grid */}
                  {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg border border-neutral-200 animate-pulse">
                          <div className="aspect-square bg-neutral-100"></div>
                          <div className="p-3 space-y-2">
                            <div className="h-4 bg-neutral-100 rounded"></div>
                            <div className="h-3 bg-neutral-100 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredProducts.map(product => {
                        const inBox = giftBox?.items.find(item => item.product.id === product.id);
                        
                        return (
                          <div
                            key={product.id}
                            className="bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all overflow-hidden group"
                          >
                            <div className="relative aspect-square bg-neutral-50">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = `https://via.placeholder.com/400x400/f3f4f6/000000/?text=${encodeURIComponent(product.name)}`;
                                }}
                              />
                              {inBox && (
                                <div className="absolute top-2 right-2 bg-neutral-900 text-white text-xs px-2 py-1 rounded-full">
                                  {inBox.quantity} {locale === 'en' ? 'in box' : 'في الصندوق'}
                                </div>
                              )}
                            </div>
                            
                            <div className="p-3">
                              <h3 className="font-medium text-sm mb-1 text-neutral-900 line-clamp-2">
                                {product.name}
                              </h3>
                              <p className="text-neutral-900 font-semibold mb-3 flex items-center gap-1">
                                <SARSymbol className="w-4 h-4" />
                                {product.price.toFixed(2)}
                              </p>
                              
                              <button
                                onClick={() => addToGiftBox(product)}
                                disabled={inBox && inBox.quantity >= product.stock_quantity}
                                className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                                {locale === 'en' ? 'Add to Box' : 'أضف للصندوق'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
                      <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-600">
                        {locale === 'en' ? 'No products found in this category' : 'لا توجد منتجات في هذه الفئة'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Step 2: Review & Personalize */
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-neutral-200 p-6">
                    <h2 className="text-xl font-medium mb-4 text-neutral-900">
                      {locale === 'en' ? 'Your Gift Box Items' : 'محتويات صندوق الهدايا'}
                    </h2>
                    
                    <div className="space-y-4">
                      {giftBox?.items.map(item => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/80x80/f3f4f6/000000/?text=${encodeURIComponent(item.product.name)}`;
                            }}
                          />
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-neutral-900 mb-1">{item.product.name}</h3>
                            <p className="text-sm text-neutral-600 mb-2 flex items-center gap-1">
                              <SARSymbol className="w-3 h-3" />
                              {item.product.price.toFixed(2)}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock_quantity}
                                className="w-7 h-7 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-neutral-900 mb-2 flex items-center gap-1">
                              <SARSymbol className="w-4 h-4" />
                              {(item.product.price * item.quantity).toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeFromGiftBox(item.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gift Message */}
                  <div className="bg-white rounded-lg border border-neutral-200 p-6">
                    <h2 className="text-xl font-medium mb-4 text-neutral-900">
                      {locale === 'en' ? 'Add a Personal Message' : 'أضف رسالة شخصية'}
                    </h2>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder={locale === 'en' ? 'Write your message here...' : 'اكتب رسالتك هنا...'}
                      className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                      rows={4}
                      maxLength={200}
                    />
                    <p className="text-xs text-neutral-500 mt-2">
                      {giftMessage.length}/200 {locale === 'en' ? 'characters' : 'حرف'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gift Box Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-neutral-200 p-6 sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-neutral-700" />
                  <h2 className="text-lg font-medium text-neutral-900">
                    {locale === 'en' ? 'Your Gift Box' : 'صندوق الهدايا'}
                  </h2>
                </div>

                {!giftBox || giftBox.items.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-500">
                      {locale === 'en' ? 'Your gift box is empty' : 'صندوق الهدايا فارغ'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4 pb-4 border-b border-neutral-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">
                          {locale === 'en' ? 'Items' : 'العناصر'}
                        </span>
                        <span className="font-medium">{giftBox.items.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">
                          {locale === 'en' ? 'Total Quantity' : 'الكمية الإجمالية'}
                        </span>
                        <span className="font-medium">
                          {giftBox.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-medium text-neutral-900">
                        {locale === 'en' ? 'Total' : 'المجموع'}
                      </span>
                      <span className="text-2xl font-bold text-neutral-900 flex items-center gap-1">
                        <SARSymbol className="w-6 h-6" />
                        {getTotalPrice().toFixed(2)}
                      </span>
                    </div>

                    {step === 1 ? (
                      <button
                        onClick={() => setStep(2)}
                        className="w-full bg-neutral-900 text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                      >
                        {locale === 'en' ? 'Continue to Review' : 'متابعة للمراجعة'}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={handleCheckout}
                          className="w-full bg-neutral-900 text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                        >
                          {locale === 'en' ? 'Proceed to Checkout' : 'إتمام الطلب'}
                        </button>
                        <button
                          onClick={handleAddToCart}
                          className="w-full flex items-center justify-center gap-2 border border-neutral-300 text-neutral-900 py-3 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
                        >
                          <ShoppingBasket className="w-4 h-4" />
                          {locale === 'en' ? 'Add to Cart' : 'أضف للسلة'}
                        </button>
                        <button
                          onClick={() => setStep(1)}
                          className="w-full text-neutral-600 py-2 text-sm hover:text-neutral-900"
                        >
                          {locale === 'en' ? 'Add More Items' : 'أضف المزيد'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
