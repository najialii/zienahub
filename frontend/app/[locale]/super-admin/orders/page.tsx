'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Search,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: string | number;
  product?: {
    id: number;
    name: string;
    image_url?: string;
  };
}

interface DeliveryPerson {
  id: number;
  name: string;
  phone: string;
}

interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  total_amount: string | number;
  subtotal_amount: string | number;
  discount_amount: string | number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  tracking_number?: string | null;
  tracking_carrier?: string | null;
  admin_notes?: string | null;
  is_gift: boolean;
  recipient_name?: string | null;
  gift_message?: string | null;
  delivery_person_id?: number | null;
  delivered_at?: string | null;
  created_at: string;
  items: OrderItem[];
  delivery_person?: DeliveryPerson | null;
}

interface PaginatedResponse {
  data: Order[];
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

function statusConfig(status: Order['status']) {
  const map = {
    pending: { label: 'Pending', icon: Clock, cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    processing: { label: 'Processing', icon: AlertCircle, cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    shipped: { label: 'Shipped', icon: Truck, cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    delivered: { label: 'Delivered', icon: CheckCircle, cls: 'bg-green-100 text-green-700 border-green-200' },
    cancelled: { label: 'Cancelled', icon: XCircle, cls: 'bg-red-100 text-red-700 border-red-200' },
  };
  return map[status] ?? { label: status, icon: Package, cls: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SuperAdminOrdersPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'en';

  const [orders, setOrders] = useState<Order[]>([]);
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

  // Selected orders for bulk actions
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // View order modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Process order modal
  const [processingOrder, setProcessingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('per_page', String(perPage));
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`${API_BASE}/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: PaginatedResponse = await res.json();

      setOrders(json.data ?? []);
      setCurrentPage(json.current_page);
      setLastPage(json.last_page);
      setTotal(json.total);
      setFrom(json.from);
      setTo(json.to);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
    setCurrentPage(1);
  };

  const toggleSelectOrder = (id: number) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  const bulkUpdateStatus = async () => {
    if (selectedOrders.size === 0 || !bulkStatus) return;
    setBulkUpdating(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/orders/bulk-update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          order_ids: Array.from(selectedOrders),
          status: bulkStatus,
        }),
      });
      
      if (response.ok) {
        alert(locale === 'ar' ? 'تم تحديث الطلبات بنجاح' : 'Orders updated successfully');
      }
      
      setSelectedOrders(new Set());
      setBulkStatus('');
      fetchOrders();
    } catch (error) {
      alert(locale === 'ar' ? 'فشل تحديث الطلبات' : 'Failed to update orders');
    } finally {
      setBulkUpdating(false);
    }
  };

  const openProcessModal = (order: Order) => {
    setProcessingOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.tracking_number || '');
    setTrackingCarrier(order.tracking_carrier || '');
    setAdminNotes(order.admin_notes || '');
  };

  const closeProcessModal = () => {
    setProcessingOrder(null);
    setNewStatus('');
    setTrackingNumber('');
    setTrackingCarrier('');
    setAdminNotes('');
  };

  const updateOrderStatus = async () => {
    if (!processingOrder || !newStatus) return;
    setUpdating(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/orders/${processingOrder.id}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          tracking_number: trackingNumber || null,
          tracking_carrier: trackingCarrier || null,
          admin_notes: adminNotes || null,
        }),
      });

      if (response.ok) {
        alert(locale === 'ar' ? 'تم تحديث الطلب بنجاح' : 'Order updated successfully');
        closeProcessModal();
        fetchOrders();
      } else {
        alert(locale === 'ar' ? 'فشل تحديث الطلب' : 'Failed to update order');
      }
    } catch (error) {
      alert(locale === 'ar' ? 'فشل تحديث الطلب' : 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const hasFilters = search || statusFilter;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black flex items-center gap-3">
            <Package className="w-8 h-8" />
            {locale === 'ar' ? 'الطلبات' : 'Orders'}
          </h1>
          <p className="text-neutral-500 mt-1">
            {locale === 'ar' ? 'إدارة جميع الطلبات' : 'Manage all orders across the platform'}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {locale === 'ar' ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Stats bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center gap-6">
        <div className="flex items-center gap-2 text-neutral-600">
          <Package className="w-5 h-5 text-neutral-400" />
          <span className="font-semibold text-black">{total.toLocaleString()}</span>
          <span className="text-sm">{locale === 'ar' ? 'إجمالي الطلبات' : 'total orders'}</span>
        </div>
        {from !== null && to !== null && (
          <div className="text-sm text-neutral-500">
            {locale === 'ar' ? `عرض ${from}–${to}` : `Showing ${from}–${to}`}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <Filter className="w-4 h-4" />
          {locale === 'ar' ? 'الفلاتر' : 'Filters'}
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'البحث برقم الطلب أو الاسم...' : 'Search by order number or name...'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-neutral-800 transition-colors"
            >
              {locale === 'ar' ? 'بحث' : 'Search'}
            </button>
          </form>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
          >
            <option value="">{locale === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="processing">{locale === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
            <option value="shipped">{locale === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
            <option value="delivered">{locale === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
            <option value="cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
          </select>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-500 hover:text-black border border-neutral-200 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
              {locale === 'ar' ? 'مسح' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedOrders.size} {locale === 'ar' ? 'طلب محدد' : `order${selectedOrders.size > 1 ? 's' : ''} selected`}
            </span>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {locale === 'ar' ? 'مسح التحديد' : 'Clear selection'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="px-3 py-2 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
              <option value="">{locale === 'ar' ? 'تغيير الحالة' : 'Change status'}</option>
              <option value="processing">{locale === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
              <option value="shipped">{locale === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
              <option value="delivered">{locale === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
              <option value="cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
            </select>
            <button
              onClick={bulkUpdateStatus}
              disabled={bulkUpdating || !bulkStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {bulkUpdating ? (locale === 'ar' ? 'جاري التحديث...' : 'Updating...') : (locale === 'ar' ? 'تحديث' : 'Update')}
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
              onClick={fetchOrders}
              className="text-sm underline text-neutral-500 hover:text-black"
            >
              {locale === 'ar' ? 'حاول مرة أخرى' : 'Try again'}
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
            <Package className="w-12 h-12" />
            <p className="font-medium">{locale === 'ar' ? 'لا توجد طلبات' : 'No orders found'}</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm underline hover:text-black">
                {locale === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
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
                      checked={selectedOrders.size === orders.length && orders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-neutral-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600 w-12">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">{locale === 'ar' ? 'رقم الطلب' : 'Order'}</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">{locale === 'ar' ? 'العميل' : 'Customer'}</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">{locale === 'ar' ? 'المنتجات' : 'Items'}</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">{locale === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-3 text-center font-semibold text-neutral-600">{locale === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order, idx) => {
                  const statusInfo = statusConfig(order.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="w-4 h-4 rounded border-neutral-300"
                      />
                    </td>

                    {/* Row number */}
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {(from ?? 1) + idx}
                    </td>

                    {/* Order Number */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-black">{order.order_number}</p>
                        {order.tracking_number && (
                          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {order.tracking_number}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-800">{order.shipping_name}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{order.shipping_phone}</p>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                        {order.items.length} {locale === 'ar' ? 'منتج' : `item${order.items.length > 1 ? 's' : ''}`}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-black">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                        {Number(order.discount_amount) > 0 && (
                          <p className="text-xs text-green-600 mt-0.5">
                            -${Number(order.discount_amount).toFixed(2)} {locale === 'ar' ? 'خصم' : 'discount'}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${statusInfo.cls}`}>
                        <StatusIcon className="w-3 h-3" />
                        {locale === 'ar' ? statusInfo.label : statusInfo.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {locale === 'ar' ? 'عرض' : 'View'}
                        </button>
                        <button
                          onClick={() => openProcessModal(order)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition-colors"
                          title={locale === 'ar' ? 'معالجة الطلب' : 'Process Order'}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {locale === 'ar' ? 'معالجة' : 'Process'}
                        </button>
                      </div>
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
            {locale === 'ar' ? `صفحة ${currentPage} من ${lastPage}` : `Page ${currentPage} of ${lastPage}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {locale === 'ar' ? 'السابق' : 'Previous'}
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
              {locale === 'ar' ? 'التالي' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Process Order Modal */}
      {processingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black">{locale === 'ar' ? 'معالجة الطلب' : 'Process Order'}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{processingOrder.order_number}</p>
                </div>
                <button
                  onClick={closeProcessModal}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Status */}
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-sm text-neutral-600 mb-2">{locale === 'ar' ? 'الحالة الحالية' : 'Current Status'}</p>
                {(() => {
                  const statusInfo = statusConfig(processingOrder.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${statusInfo.cls}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusInfo.label}
                    </span>
                  );
                })()}
              </div>

              {/* Order Summary */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-neutral-600">{locale === 'ar' ? 'العميل' : 'Customer'}</p>
                    <p className="font-medium text-black">{processingOrder.shipping_name}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">{locale === 'ar' ? 'المبلغ' : 'Amount'}</p>
                    <p className="font-medium text-black">${Number(processingOrder.total_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">{locale === 'ar' ? 'المنتجات' : 'Items'}</p>
                    <p className="font-medium text-black">{processingOrder.items.length} {locale === 'ar' ? 'منتج' : 'items'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">{locale === 'ar' ? 'التاريخ' : 'Date'}</p>
                    <p className="font-medium text-black">
                      {new Date(processingOrder.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {locale === 'ar' ? 'تحديث الحالة' : 'Update Status'}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
                  >
                    <option value="pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                    <option value="processing">{locale === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
                    <option value="shipped">{locale === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                    <option value="delivered">{locale === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                    <option value="cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                  </select>
                </div>

                {/* Tracking Information */}
                {(newStatus === 'shipped' || newStatus === 'delivered') && (
                  <div className="space-y-4 bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h4 className="font-semibold text-black flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      {locale === 'ar' ? 'معلومات الشحن' : 'Tracking Information'}
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {locale === 'ar' ? 'رقم التتبع' : 'Tracking Number'}
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder={locale === 'ar' ? 'أدخل رقم التتبع' : 'Enter tracking number'}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {locale === 'ar' ? 'شركة الشحن' : 'Carrier'}
                      </label>
                      <input
                        type="text"
                        value={trackingCarrier}
                        onChange={(e) => setTrackingCarrier(e.target.value)}
                        placeholder={locale === 'ar' ? 'مثال: DHL, FedEx, UPS' : 'e.g., DHL, FedEx, UPS'}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {locale === 'ar' ? 'ملاحظات الإدارة' : 'Admin Notes'}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={locale === 'ar' ? 'أضف ملاحظات إضافية...' : 'Add additional notes...'}
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={updateOrderStatus}
                  disabled={updating || !newStatus}
                  className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {locale === 'ar' ? 'جاري التحديث...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {locale === 'ar' ? 'تحديث الطلب' : 'Update Order'}
                    </>
                  )}
                </button>
                <button
                  onClick={closeProcessModal}
                  disabled={updating}
                  className="flex-1 border border-neutral-200 py-3 rounded-xl text-sm hover:bg-neutral-50 transition-colors"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black">{locale === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{viewingOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                {(() => {
                  const statusInfo = statusConfig(viewingOrder.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${statusInfo.cls}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusInfo.label}
                    </span>
                  );
                })()}
                {viewingOrder.is_gift && (
                  <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-pink-100 text-pink-700 border border-pink-200">
                    🎁 {locale === 'ar' ? 'هدية' : 'Gift'}
                  </span>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-black flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {locale === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-neutral-500">{locale === 'ar' ? 'الاسم' : 'Name'}</p>
                    <p className="font-medium text-black">{viewingOrder.shipping_name}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {locale === 'ar' ? 'الهاتف' : 'Phone'}
                    </p>
                    <p className="font-medium text-black">{viewingOrder.shipping_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-neutral-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </p>
                    <p className="font-medium text-black">{viewingOrder.shipping_email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {locale === 'ar' ? 'العنوان' : 'Address'}
                    </p>
                    <p className="font-medium text-black">
                      {viewingOrder.shipping_address}, {viewingOrder.shipping_city}, {viewingOrder.shipping_postal_code}, {viewingOrder.shipping_country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gift Info */}
              {viewingOrder.is_gift && (
                <div className="bg-pink-50 rounded-xl p-4 space-y-3 border border-pink-200">
                  <h4 className="font-semibold text-black">🎁 {locale === 'ar' ? 'معلومات الهدية' : 'Gift Information'}</h4>
                  <div className="space-y-2 text-sm">
                    {viewingOrder.recipient_name && (
                      <div>
                        <p className="text-neutral-600">{locale === 'ar' ? 'المستلم' : 'Recipient'}</p>
                        <p className="font-medium text-black">{viewingOrder.recipient_name}</p>
                      </div>
                    )}
                    {viewingOrder.gift_message && (
                      <div>
                        <p className="text-neutral-600">{locale === 'ar' ? 'الرسالة' : 'Message'}</p>
                        <p className="font-medium text-black italic">"{viewingOrder.gift_message}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-black">{locale === 'ar' ? 'المنتجات' : 'Order Items'}</h4>
                <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-200">
                  {viewingOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-neutral-400" />
                        </div>
                        <div>
                          <p className="font-medium text-black">{item.product?.name || `Product #${item.product_id}`}</p>
                          <p className="text-xs text-neutral-500">{locale === 'ar' ? 'الكمية' : 'Qty'}: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-black">${Number(item.price_at_purchase).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-medium text-black">${Number(viewingOrder.subtotal_amount).toFixed(2)}</span>
                </div>
                {Number(viewingOrder.discount_amount) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                    <span className="font-medium text-green-600">-${Number(viewingOrder.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-neutral-200">
                  <span className="text-black">{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-black">${Number(viewingOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Tracking Info */}
              {viewingOrder.tracking_number && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-semibold text-black flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4" />
                    {locale === 'ar' ? 'معلومات الشحن' : 'Tracking Information'}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-neutral-600">{locale === 'ar' ? 'رقم التتبع' : 'Tracking Number'}:</span> <span className="font-medium text-black">{viewingOrder.tracking_number}</span></p>
                    {viewingOrder.tracking_carrier && (
                      <p><span className="text-neutral-600">{locale === 'ar' ? 'شركة الشحن' : 'Carrier'}:</span> <span className="font-medium text-black">{viewingOrder.tracking_carrier}</span></p>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Person */}
              {viewingOrder.delivery_person && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-black flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4" />
                    {locale === 'ar' ? 'مندوب التوصيل' : 'Delivery Person'}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-neutral-600">{locale === 'ar' ? 'الاسم' : 'Name'}:</span> <span className="font-medium text-black">{viewingOrder.delivery_person.name}</span></p>
                    <p><span className="text-neutral-600">{locale === 'ar' ? 'الهاتف' : 'Phone'}:</span> <span className="font-medium text-black">{viewingOrder.delivery_person.phone}</span></p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {viewingOrder.admin_notes && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <h4 className="font-semibold text-black mb-2">{locale === 'ar' ? 'ملاحظات الإدارة' : 'Admin Notes'}</h4>
                  <p className="text-sm text-neutral-700">{viewingOrder.admin_notes}</p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setViewingOrder(null)}
                className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium transition-colors"
              >
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
