'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Package, Save, Tag as TagIcon, DollarSign, Box, Layers } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number | null;
  stock_quantity: number;
  status: string;
  image_url?: string | null;
  brand?: string | null;
  tag_id?: number | null;
  tenant?: {
    id: number;
    name: string;
  } | null;
  subcategory?: {
    id: number;
    name: string;
    category?: { id: number; name: string } | null;
  } | null;
}

interface Tag {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  type: string;
  is_active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeliveryEditProductPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = (params?.locale as string) || 'en';
  const productId = params?.id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch product and tags ────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) {
          router.push(`/${locale}/login`);
          return;
        }

        // Fetch product
        const productRes = await fetch(`${API_BASE}/super-admin/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!productRes.ok) throw new Error('Failed to load product');
        const productData = await productRes.json();
        setProduct(productData);
        setSelectedTagId(String(productData.tag_id || ''));

        // Fetch tags
        const tagsRes = await fetch(`${API_BASE}/tags`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!tagsRes.ok) throw new Error('Failed to load tags');
        const tagsData = await tagsRes.json();
        const tagsList: Tag[] = tagsData.success && tagsData.data ? tagsData.data : [];
        setTags(tagsList);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId, locale, router]);

  // ── Save changes ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/super-admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          tag_id: selectedTagId || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to save changes');
      
      // Navigate back to delivery page
      router.push(`/${locale}/super-admin/delivery`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => router.push(`/${locale}/super-admin/delivery`)}
          className="text-sm underline text-neutral-500 hover:text-black"
        >
          {locale === 'ar' ? 'العودة إلى التوصيل' : 'Back to delivery'}
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-neutral-500">
          {locale === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
        </p>
        <button
          onClick={() => router.push(`/${locale}/super-admin/delivery`)}
          className="text-sm underline text-neutral-500 hover:text-black"
        >
          {locale === 'ar' ? 'العودة إلى التوصيل' : 'Back to delivery'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/${locale}/super-admin/delivery`)}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-black">
            {locale === 'ar' ? 'تعديل وسم المنتج' : 'Edit Product Tag'}
          </h1>
          <p className="text-neutral-500 mt-1">
            {locale === 'ar' 
              ? 'عرض تفاصيل المنتج وتحديث الوسم' 
              : 'View product details and update tag'}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Product Details Card - All fields disabled */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          {locale === 'ar' ? 'معلومات المنتج' : 'Product Information'}
        </h2>
        
        <div className="flex items-start gap-6">
          {/* Product Image */}
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-neutral-300" />
              </div>
            )}
          </div>

          {/* Product Details Grid */}
          <div className="flex-1 space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1">
                {locale === 'ar' ? 'اسم المنتج' : 'Product Name'}
              </label>
              <input
                type="text"
                value={product.name}
                disabled
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-700 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* SKU/Slug */}
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  {locale === 'ar' ? 'رمز المنتج' : 'SKU / Slug'}
                </label>
                <input
                  type="text"
                  value={product.slug}
                  disabled
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-700 cursor-not-allowed"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {locale === 'ar' ? 'السعر' : 'Price'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`$${product.price.toFixed(2)}`}
                    disabled
                    className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-700 cursor-not-allowed"
                  />
                  {product.old_price && (
                    <span className="text-sm text-neutral-400 line-through">
                      ${product.old_price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1">
                  <Box className="w-4 h-4" />
                  {locale === 'ar' ? 'الكمية المتوفرة' : 'Stock Quantity'}
                </label>
                <input
                  type="text"
                  value={product.stock_quantity}
                  disabled
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-700 cursor-not-allowed"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </label>
                <input
                  type="text"
                  value={product.status}
                  disabled
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-700 cursor-not-allowed capitalize"
                />
              </div>

              {/* Brand */}
              {product.brand && (
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">
                    {locale === 'ar' ? 'العلامة التجارية' : 'Brand'}
                  </label>
                  <input
                    type="text"
                    value={product.brand}
                    disabled
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-700 cursor-not-allowed"
                  />
                </div>
              )}

              {/* Tenant */}
              {product.tenant && (
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">
                    {locale === 'ar' ? 'المتجر' : 'Tenant'}
                  </label>
                  <input
                    type="text"
                    value={product.tenant.name}
                    disabled
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-700 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            {/* Category */}
            {product.subcategory && (
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  {locale === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <input
                  type="text"
                  value={`${product.subcategory.name}${
                    product.subcategory.category ? ` (${product.subcategory.category.name})` : ''
                  }`}
                  disabled
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-700 cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tag Selection Card - ONLY EDITABLE FIELD */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-blue-600" />
          {locale === 'ar' ? 'وسم المنتج' : 'Product Tag'}
          <span className="ml-auto text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {locale === 'ar' ? 'قابل للتعديل' : 'Editable'}
          </span>
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            {locale === 'ar' ? 'اختر الوسم' : 'Select Tag'}
          </label>
          <select
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">
              {locale === 'ar' ? 'بدون وسم' : 'No Tag'}
            </option>
            {tags.map((tag) => (
              <option key={tag.id} value={String(tag.id)}>
                {locale === 'ar' ? tag.name_ar : tag.name_en}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-500">
            {locale === 'ar'
              ? 'تساعد الوسوم في تصنيف المنتجات للعروض الترويجية والأقسام المميزة والتصفية'
              : 'Tags help categorize products for promotions, featured sections, and filtering'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          {saving 
            ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
            : (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
        </button>
        <button
          onClick={() => router.push(`/${locale}/super-admin/delivery`)}
          disabled={saving}
          className="px-6 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
