'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Package,
  Users, Store, Phone, Mail, Calendar, RefreshCw, Edit2, DollarSign,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  status: string;
  image_url: string | null;
  created_at: string;
}

interface TenantUser {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
}

interface TenantDetail {
  id: number;
  name: string;
  slug: string;
  phone_number: string | null;
  description: string | null;
  address: string | null;
  logo: string | null;
  is_active: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  subscription_status: string;
  monthly_fee: number;
  pricing_tier_id: number | null;
  pricing_tier?: {
    id: number;
    name: string;
    monthly_fee: number;
  };
  effective_monthly_fee: number;
  subscription_ends_at: string | null;
  users_count: number;
  products_count: number;
  users: TenantUser[];
  products: Product[];
  created_at: string;
}

const verificationBadge = (status: TenantDetail['verification_status']) => {
  const map = {
    pending:  { cls: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3.5 h-3.5" /> },
    approved: { cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    rejected: { cls: 'bg-red-100 text-red-700',    icon: <XCircle className="w-3.5 h-3.5" /> },
  };
  const { cls, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const router = useRouter();

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');
  const [showEditFee, setShowEditFee] = useState(false);
  const [newMonthlyFee, setNewMonthlyFee] = useState('0');
  const [pricingTiers, setPricingTiers] = useState<Array<{ id: number; name: string; monthly_fee: number }>>([]);
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const [useCustomFee, setUseCustomFee] = useState(false);

  const headers = () => {
    const token = localStorage.getItem('auth_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchTenant = async () => {
    try {
      const res = await fetch(`${API}/super-admin/tenants/${id}`, { headers: headers() });
      const data = await res.json();
      setTenant(data.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingTiers = async () => {
    try {
      const res = await fetch(`${API}/super-admin/pricing-tiers`, { headers: headers() });
      const data = await res.json();
      setPricingTiers(data.data.filter((t: any) => t.is_active));
    } catch (err) {
      console.error('Failed to fetch pricing tiers', err);
    }
  };

  useEffect(() => { 
    fetchTenant();
    fetchPricingTiers();
  }, [id]);

  useEffect(() => {
    if (tenant) {
      setNewMonthlyFee((tenant.monthly_fee || 0).toString());
      setSelectedTierId(tenant.pricing_tier_id);
      setUseCustomFee(!tenant.pricing_tier_id);
    }
  }, [tenant]);

  const updateFee = async () => {
    const payload: any = {};
    
    if (useCustomFee) {
      payload.pricing_tier_id = null;
      payload.monthly_fee = parseFloat(newMonthlyFee);
    } else {
      payload.pricing_tier_id = selectedTierId;
    }

    await fetch(`${API}/super-admin/tenants/${id}/subscription`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(payload),
    });

    setShowEditFee(false);
    await fetchTenant();
  };

  const approve = async () => {
    setActionLoading(true);
    await fetch(`${API}/super-admin/tenants/${id}/approve`, { method: 'POST', headers: headers() });
    await fetchTenant();
    setActionLoading(false);
  };

  const reject = async () => {
    setActionLoading(true);
    await fetch(`${API}/super-admin/tenants/${id}/reject`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ rejection_reason: rejectReason }),
    });
    setShowRejectInput(false);
    await fetchTenant();
    setActionLoading(false);
  };

  if (loading) return (
    <div className="p-8 flex items-center gap-2 text-neutral-500">
      <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
    </div>
  );

  if (!tenant) return <div className="p-8 text-neutral-500">Tenant not found.</div>;

  const imageBase = 'http://localhost:8000';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Vendors
      </button>

      {/* Header card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {tenant.logo ? (
              <img src={tenant.logo.startsWith('/') ? `${imageBase}${tenant.logo}` : tenant.logo}
                alt={tenant.name} className="w-16 h-16 rounded-xl object-cover border border-neutral-200" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
                <Store className="w-7 h-7 text-neutral-400" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-neutral-900">{tenant.name}</h1>
              <p className="text-sm text-neutral-500">/{tenant.slug}</p>
              <div className="flex items-center gap-2 mt-1">
                {verificationBadge(tenant.verification_status)}
                <span className={`text-xs px-2 py-0.5 rounded-full ${tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {tenant.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {tenant.verification_status === 'pending' && (
              <>
                <button onClick={approve} disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => setShowRejectInput(!showRejectInput)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}
            {tenant.verification_status === 'approved' && (
              <button onClick={() => setShowRejectInput(!showRejectInput)}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50">
                <XCircle className="w-4 h-4" /> Revoke
              </button>
            )}
            {tenant.verification_status === 'rejected' && (
              <button onClick={approve} disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
                <CheckCircle className="w-4 h-4" /> Re-approve
              </button>
            )}
          </div>
        </div>

        {/* Reject input */}
        {showRejectInput && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full border border-red-200 rounded-lg p-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-red-300 bg-white" />
            <div className="flex gap-2">
              <button onClick={reject} disabled={actionLoading}
                className="px-4 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50">
                Confirm
              </button>
              <button onClick={() => setShowRejectInput(false)}
                className="px-4 py-1.5 border border-neutral-200 text-sm rounded-lg hover:bg-neutral-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        {tenant.rejection_reason && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Rejection reason: {tenant.rejection_reason}
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Products', value: tenant.products_count, icon: <Package className="w-5 h-5 text-blue-500" /> },
          { label: 'Users', value: tenant.users_count, icon: <Users className="w-5 h-5 text-purple-500" /> },
          { 
            label: 'Monthly Fee', 
            value: (
              <div className="flex items-center gap-1">
                <span>${Number(tenant.effective_monthly_fee || tenant.monthly_fee || 0).toFixed(2)}</span>
                <button onClick={() => setShowEditFee(true)} className="text-neutral-400 hover:text-neutral-600">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            ), 
            icon: <DollarSign className="w-5 h-5 text-green-500" /> 
          },
          { label: 'Sub Status', value: tenant.subscription_status, icon: <Calendar className="w-5 h-5 text-amber-500" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center">{icon}</div>
            <div>
              <p className="text-xs text-neutral-500">{label}</p>
              <div className="font-semibold text-neutral-900 capitalize">{value ?? '—'}</div>
            </div>
          </div>
        ))}
      </div>

      {tenant.pricing_tier && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          Using pricing tier: <span className="font-semibold">{tenant.pricing_tier.name}</span>
        </div>
      )}

      {/* Details row */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {tenant.phone_number && (
          <div className="flex items-center gap-2 text-neutral-600">
            <Phone className="w-4 h-4 text-neutral-400" /> {tenant.phone_number}
          </div>
        )}
        {tenant.address && (
          <div className="flex items-center gap-2 text-neutral-600">
            <Store className="w-4 h-4 text-neutral-400" /> {tenant.address}
          </div>
        )}
        {tenant.subscription_ends_at && (
          <div className="flex items-center gap-2 text-neutral-600">
            <Calendar className="w-4 h-4 text-neutral-400" />
            Expires: {new Date(tenant.subscription_ends_at).toLocaleDateString()}
          </div>
        )}
        {tenant.description && (
          <div className="md:col-span-3 text-neutral-500">{tenant.description}</div>
        )}
      </div>

      {/* Tabs: Products / Users */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-neutral-200">
          {(['products', 'users'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-neutral-900 text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
              {tab === 'products' ? `Products (${tenant.products_count})` : `Users (${tenant.users_count})`}
            </button>
          ))}
        </div>

        {/* Products tab */}
        {activeTab === 'products' && (
          <div>
            {tenant.products.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">No products yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Price</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Stock</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {tenant.products.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url.startsWith('/') ? `${imageBase}${p.image_url}` : p.image_url}
                              alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-neutral-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <Package className="w-4 h-4 text-neutral-400" />
                            </div>
                          )}
                          <span className="font-medium text-neutral-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">{Number(p.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-neutral-700">{p.stock_quantity}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div>
            {tenant.users.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">No users yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Contact</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {tenant.users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-800">{u.name || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {u.email && <div className="flex items-center gap-1 text-neutral-500 text-xs"><Mail className="w-3 h-3" />{u.email}</div>}
                          {u.phone && <div className="flex items-center gap-1 text-neutral-500 text-xs"><Phone className="w-3 h-3" />{u.phone}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Edit Fee Modal */}
      {showEditFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">Update Monthly Fee</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="radio" id="use_tier" checked={!useCustomFee}
                  onChange={() => setUseCustomFee(false)}
                  className="w-4 h-4" />
                <label htmlFor="use_tier" className="text-sm font-medium text-neutral-700">Use Pricing Tier</label>
              </div>

              {!useCustomFee && (
                <select value={selectedTierId || ''} onChange={(e) => setSelectedTierId(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
                  <option value="">Select a tier</option>
                  {pricingTiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} - ${Number(tier.monthly_fee || 0).toFixed(2)}/month
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input type="radio" id="use_custom" checked={useCustomFee}
                  onChange={() => setUseCustomFee(true)}
                  className="w-4 h-4" />
                <label htmlFor="use_custom" className="text-sm font-medium text-neutral-700">Custom Fee</label>
              </div>

              {useCustomFee && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Fee ($)</label>
                  <input type="number" step="0.01" min="0" value={newMonthlyFee}
                    onChange={(e) => setNewMonthlyFee(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowEditFee(false)}
                className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                Cancel
              </button>
              <button onClick={updateFee}
                className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
