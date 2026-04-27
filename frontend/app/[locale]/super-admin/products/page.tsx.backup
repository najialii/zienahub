'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Building2,
  Filter,
  X,
  Edit,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tenant {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

interface Subcategory {
  id: number;
  name: string;
  category?: { id: number; name: string } | null;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number | null;
  stock_quantity: number;
  status: 'active' | 'draft' | 'out-of-stock';
  image_url?: string | null;
  sku: string;
  brand?: string | null;
  tag_id?: number | null;
  created_at: string;
  tenant?: Tenant | null;
  subcategory?: Subcategory | null;
}

interface Tag {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  type: string;
  is_active: boolean;
}

interface PaginatedResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function statusBadge(status: Product['status']) {
  const map: Record<Product['status'], { label: string; cls: string }> = {
    active: { label: 'Active', cls: 'bg-green-100 text-green-700' },
    draft: { label: 'Draft', cls: 'bg-yellow-100 text-yellow-700' },
    'out-of-stock': { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-neutral-100 text-neutral-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SuperAdminProductsPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'en';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);
  const perPage = 20;

  // Filters
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Tenants list for filter dropdown
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Bulk actions
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [bulkTagId, setBulkTagId] = useState('');
  const [bulkAssigning, setBulkAssigning] = useState(false);

  // Edit modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTenantId, setEditTenantId] = useState('');
  const [editTagId, setEditTagId] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Fetch tenants for filter ──────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    
    // Fetch tenants
    fetch(`${API_BASE}/super-admin/tenants`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((data) => {
        const list: Tenant[] = Array.isArray(data) ? data : data.data ?? [];
        setTenants(list);
      })
      .catch(() => {});

    // Fetch tags
    fetch(`${API_BASE}/tags`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((data) => {
        // API returns { success: true, data: [...] }
        const list: Tag[] = data.success && data.data ? data.data : [];
        setTags(list);
      })
      .catch(() => {});
  }, []);

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('per_page', String(perPage));
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (tenantFilter) params.set('tenant_id', tenantFilter);
      if (tagFilter) params.set('tag_id', tagFilter);

      const res = await fetch(`${API_BASE}/super-admin/products?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: PaginatedResponse = await res.json();

      setProducts(json.data ?? []);
      setCurrentPage(json.current_page);
      setLastPage(json.last_page);
      setTotal(json.total);
      setFrom(json.from);
      setTo(json.to);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, tenantFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setTenantFilter('');
    setTagFilter('');
    setCurrentPage(1);
  };

  const toggleSelectProduct = (id: number) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const bulkAssignTags = async () => {
    if (selectedProducts.size === 0) return;
    setBulkAssigning(true);
    try {
      const token = getToken();
      await fetch(`${API_BASE}/super-admin/products/bulk-assign-tags`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          product_ids: Array.from(selectedProducts),
          tag_id: bulkTagId || null,
        }),
      });
      setSelectedProducts(new Set());
      setBulkTagId('');
      fetchProducts();
    } finally {
      setBulkAssigning(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditTenantId(String(product.tenant?.id || ''));
    setEditTagId(String(product.tag_id || ''));
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditTenantId('');
    setEditTagId('');
  };

  const saveProductEdit = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      const token = getToken();
      await fetch(`${API_BASE}/super-admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          tenant_id: editTenantId || null,
          tag_id: editTagId || null,
        }),
      });
      closeEditModal();
      fetchProducts();
    } finally {
      setSaving(false);
    }
  };

  const hasFilters = search || statusFilter || tenantFilter || tagFilter;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black flex items-center gap-3">
            <Package className="w-8 h-8" />
            All Products
          </h1>
          <p className="text-neutral-500 mt-1">
            View all products across every tenant on the platform
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center gap-6">
        <div className="flex items-center gap-2 text-neutral-600">
          <Package className="w-5 h-5 text-neutral-400" />
          <span className="font-semibold text-black">{total.toLocaleString()}</span>
          <span className="text-sm">total products</span>
        </div>
        {from !== null && to !== null && (
          <div className="text-sm text-neutral-500">
            Showing {from}–{to}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name or slug…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-neutral-800 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          {/* Tenant filter */}
          <select
            value={tenantFilter}
            onChange={(e) => { setTenantFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
          >
            <option value="">All Tenants</option>
            {tenants.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Tag filter */}
          <select
            value={tagFilter}
            onChange={(e) => { setTagFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {locale === 'ar' ? t.name_ar : t.name_en}
              </option>
            ))}
          </select>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-500 hover:text-black border border-neutral-200 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedProducts(new Set())}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={bulkTagId}
              onChange={(e) => setBulkTagId(e.target.value)}
              className="px-3 py-2 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
              <option value="">Remove tag</option>
              {tags.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {locale === 'ar' ? t.name_ar : t.name_en}
                </option>
              ))}
            </select>
            <button
              onClick={bulkAssignTags}
              disabled={bulkAssigning}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {bulkAssigning ? 'Assigning...' : 'Assign Tag'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchProducts}
              className="text-sm underline text-neutral-500 hover:text-black"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
            <Package className="w-12 h-12" />
            <p className="font-medium">No products found</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm underline hover:text-black">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-neutral-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600 w-12">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      Tenant
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Tag</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Price</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Added</th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((product, idx) => {
                  const productTag = tags.find((t) => t.id === product.tag_id);
                  return (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-4 h-4 rounded border-neutral-300"
                      />
                    </td>

                    {/* Row number */}
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {(from ?? 1) + idx}
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-neutral-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-black leading-tight">{product.name}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Tenant */}
                    <td className="px-4 py-3">
                      {product.tenant ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              product.tenant.is_active ? 'bg-green-400' : 'bg-neutral-300'
                            }`}
                          />
                          <span className="font-medium text-neutral-800">{product.tenant.name}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-xs">No tenant</span>
                      )}
                    </td>

                    {/* Category / Subcategory */}
                    <td className="px-4 py-3">
                      {product.subcategory ? (
                        <div>
                          <p className="text-neutral-700">{product.subcategory.name}</p>
                          {product.subcategory.category && (
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {product.subcategory.category.name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-xs">—</span>
                      )}
                    </td>

                    {/* Tag */}
                    <td className="px-4 py-3">
                      {productTag ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {locale === 'ar' ? productTag.name_ar : productTag.name_en}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic text-xs">—</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-black">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.old_price && (
                          <span className="ml-1 text-xs text-neutral-400 line-through">
                            ${product.old_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          product.stock_quantity === 0
                            ? 'text-red-500'
                            : product.stock_quantity < 10
                            ? 'text-yellow-600'
                            : 'text-neutral-700'
                        }`}
                      >
                        {product.stock_quantity}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">{statusBadge(product.status)}</td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {new Date(product.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEditModal(product)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && lastPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Page {currentPage} of {lastPage}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                let page: number;
                if (lastPage <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= lastPage - 2) {
                  page = lastPage - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-black text-white'
                        : 'border border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
              disabled={currentPage === lastPage}
              className="flex items-center gap-1 px-3 py-2 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-black">Edit Product</h3>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-700">Product</p>
              <p className="text-neutral-900">{editingProduct.name}</p>
              <p className="text-xs text-neutral-400">{editingProduct.slug}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tenant
              </label>
              <select
                value={editTenantId}
                onChange={(e) => setEditTenantId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
              >
                <option value="">No Tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tag
              </label>
              <select
                value={editTagId}
                onChange={(e) => setEditTagId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
              >
                <option value="">No Tag</option>
                {tags.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {locale === 'ar' ? t.name_ar : t.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={saveProductEdit}
                disabled={saving}
                className="flex-1 bg-black text-white py-2 rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={closeEditModal}
                disabled={saving}
                className="flex-1 border border-neutral-200 py-2 rounded-xl text-sm hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
