'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Package, Save, Tag as TagIcon } from 'lucide-react';

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

export default function EditProductPage() {
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
      
      // Navigate back to products list
      router.push(`/${locale}/super-admin/products`);
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
          onClick={() => router.push(`/${locale}/super-admin/products`)}
          className="text-sm underline text-neutral-500 hover:text-black"
        >
          Back to products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-neutral-500">Product not found</p>
        <button
          onClick={() => router.push(`/${locale}/super-admin/products`)}
          className="text-sm underline text-neutral-500 hover:text-black"
        >
          Back to products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/${locale}/super-admin/products`)}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-black">Edit Product Tag</h1>
          <p className="text-neutral-500 mt-1">Assign or update the tag for this product</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Product Info Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Information
        </h2>
        
        <div className="flex items-start gap-4">
          {/* Product Image */}
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-10 h-10 text-neutral-300" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-neutral-500">Product Name</p>
              <p className="text-lg font-semibold text-black">{product.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">SKU / Slug</p>
                <p className="text-sm text-neutral-700">{product.slug}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Price</p>
                <p className="text-sm text-neutral-700 font-medium">
                  ${product.price.toFixed(2)}
                  {product.old_price && (
                    <span className="ml-2 text-xs text-neutral-400 line-through">
                      ${product.old_price.toFixed(2)}
                    </span>
                  )}
                </p>
              </div>

              {product.tenant && (
                <div>
                  <p className="text-sm text-neutral-500">Tenant</p>
                  <p className="text-sm text-neutral-700">{product.tenant.name}</p>
                </div>
              )}

              {product.subcategory && (
                <div>
                  <p className="text-sm text-neutral-500">Category</p>
                  <p className="text-sm text-neutral-700">
                    {product.subcategory.name}
                    {product.subcategory.category && (
                      <span className="text-xs text-neutral-400 ml-1">
                        ({product.subcategory.category.name})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tag Selection Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <TagIcon className="w-5 h-5" />
          Product Tag
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Select Tag
          </label>
          <select
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
          >
            <option value="">No Tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={String(tag.id)}>
                {locale === 'ar' ? tag.name_ar : tag.name_en}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-500">
            Tags help categorize products for promotions, featured sections, and filtering
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
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => router.push(`/${locale}/super-admin/products`)}
          disabled={saving}
          className="px-6 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
