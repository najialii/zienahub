'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingBasket, Heart, Minus, Plus, Check, Store, MapPin, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RelatedProducts from '@/components/RelatedProducts';
import { productsApi, tenantsApi } from '@/lib/api';
import { useCartStore } from '@/lib/cartStore';
import { useWishlistStore } from '@/lib/wishlistStore';
import type { Product } from '@/lib/types';
import Price from '@/components/Price';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const locale = useLocale() as 'en' | 'ar';
  const t = useTranslations('product');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null); // New state for Shop data
  
  const [loading, setLoading] = useState(true);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  
  const { addItem, items, updateQuantity: updateCartQuantity } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  useEffect(() => {
    const fetchProductAndTenant = async () => {
      try {
        const slug = params.slug as string;
        const productData = await productsApi.getBySlug(slug, locale);
        setProduct(productData);
        console.log("asdasda0",productData)

        if (productData?.tenant_id) {
          setTenantLoading(true);
          const tenantData = await tenantsApi.getById(productData.tenant_id);
          setTenant(tenantData);
          console.log("dgdgdg",tenantData)
        }
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setTenantLoading(false);
      }
    };

    fetchProductAndTenant();
  }, [params.slug, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="animate-pulse max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-neutral-200 h-[500px] rounded-xl"></div>
              <div className="space-y-6">
                <div className="h-10 bg-neutral-200 w-3/4 rounded"></div>
                <div className="h-6 bg-neutral-200 w-1/4 rounded"></div>
                <div className="h-32 bg-neutral-200 rounded"></div>
                <div className="h-12 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">{t('notFound')}</h1>
            <p className="text-neutral-600">{t('notFoundDesc')}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const cartItem = items.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (product.stock_quantity === 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
      sku: product.sku,
      quantity: quantity,
    });
  };

  const handleToggleWishlist = () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-2 md:px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
          
          {/* Left: Product Image */}
          <div className="relative">
            <div className="aspect-square relative bg-white border border-neutral-100 rounded-2xl overflow-hidden p-4 md:p-8">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                  inWishlist ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur text-neutral-600 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''} ${isHeartAnimating ? 'animate-heart-beat' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right: Product Details & Shop Info */}
          <div className="flex flex-col space-y-6">
            
            {/* Shop Badge / Info Section */}
            {tenant && (
              <div className="flex items-center gap-3 p-3 bg-white border border-neutral-100 rounded-xl shadow-sm self-start">
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-600">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">
                    {locale === 'en' ? 'Sold by' : 'يباع بواسطة'}
                  </p>
                  <p className="text-sm font-semibold text-neutral-900">{tenant.name}</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-blue-500 ml-auto" />
              </div>
            )}

            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-neutral-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <Price amount={product.price} className="text-3xl font-bold text-neutral-900" />
                {product.stock_quantity > 0 && (
                  <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                    {locale === 'en' ? 'IN STOCK' : 'متوفر'}
                  </span>
                )}
              </div>
            </div>

            <div className="py-4 border-y border-neutral-100">
              <p className="text-neutral-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {product.stock_quantity > 0 && quantityInCart === 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-neutral-200 rounded-xl bg-white">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-red-500"><Minus className="w-4 h-4" /></button>
                    <span className="px-6 font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="p-3 hover:text-green-500"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              )}

              {quantityInCart > 0 ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 font-bold">
                    <Check className="w-5 h-5" /> <span>{quantityInCart} {locale === 'en' ? 'in cart' : 'في السلة'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => cartItem && updateCartQuantity(cartItem.id, quantityInCart - 1)} className="p-2 bg-white rounded-lg shadow-sm"><Minus className="w-4 h-4" /></button>
                    <button onClick={() => cartItem && quantityInCart < product.stock_quantity && updateCartQuantity(cartItem.id, quantityInCart + 1)} className="p-2 bg-white rounded-lg shadow-sm"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="w-full py-4 bg-neutral-900 text-white hover:bg-black transition-all font-bold rounded-xl flex items-center justify-center gap-3 disabled:bg-neutral-300"
                >
                  <ShoppingBasket className="w-5 h-5" />
                  {locale === 'en' ? 'Add to Cart' : 'أضف إلى السلة'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm pt-4">
              <div className="p-3 bg-white rounded-xl border border-neutral-100">
                <p className="text-neutral-500 mb-1">{locale === 'en' ? 'SKU' : 'رمز المنتج'}</p>
                <p className="font-bold">{product.sku}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-neutral-100">
                <p className="text-neutral-500 mb-1">{locale === 'en' ? 'Category' : 'الفئة'}</p>
                <p className="font-bold">{product.category?.name || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <RelatedProducts productSlug={params.slug as string} />
      <Footer />
    </div>
  );
}