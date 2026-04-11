'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Save, Trash2, Users, CreditCard, AlertTriangle, Building2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  subscription_plan: string;
  subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled';
  monthly_price: number;
  max_users: number;
  max_products: number;
  subscription_starts_at?: string | null;
  subscription_ends_at?: string | null;
  is_active: boolean;
  users_count?: number;
  tenant_admins_count?: number;
}

interface DashboardStats {
  total_tenants: number;
  active_subscriptions: number;
  expiring_soon: number;
  monthly_recurring_revenue: number;
  tenant_admins: number;
  super_admins: number;
}

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSubscriptionId, setSavingSubscriptionId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    subscription_plan: 'starter',
    subscription_status: 'trial',
    monthly_price: '99',
    max_users: '5',
    max_products: '1000',
    subscription_starts_at: '',
    subscription_ends_at: '',
  });

  const authHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchTenants = async () => {
    const response = await fetch(`${API_BASE_URL}/super-admin/tenants`, {
      headers: authHeaders(),
    });
    const result = await response.json();
    setTenants(result.data || []);
  };

  const fetchDashboard = async () => {
    const response = await fetch(`${API_BASE_URL}/super-admin/dashboard`, {
      headers: authHeaders(),
    });
    const result = await response.json();
    setStats(result.data || null);
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchDashboard(), fetchTenants()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchDashboard(), fetchTenants()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const createTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/tenants`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          monthly_price: Number(form.monthly_price),
          max_users: Number(form.max_users),
          max_products: Number(form.max_products),
          subscription_starts_at: form.subscription_starts_at || null,
          subscription_ends_at: form.subscription_ends_at || null,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create tenant');
      }
      setForm({
        name: '',
        slug: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        subscription_plan: 'starter',
        subscription_status: 'trial',
        monthly_price: '99',
        max_users: '5',
        max_products: '1000',
        subscription_starts_at: '',
        subscription_ends_at: '',
      });
      await refreshData();
    } finally {
      setCreating(false);
    }
  };

  const deleteTenant = async (id: number) => {
    await fetch(`${API_BASE_URL}/super-admin/tenants/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await refreshData();
  };

  const updateTenantSubscription = async (tenant: Tenant) => {
    setSavingSubscriptionId(tenant.id);
    try {
      await fetch(`${API_BASE_URL}/super-admin/tenants/${tenant.id}/subscription`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          subscription_plan: tenant.subscription_plan,
          subscription_status: tenant.subscription_status,
          monthly_price: Number(tenant.monthly_price),
          max_users: Number(tenant.max_users),
          max_products: Number(tenant.max_products),
          subscription_starts_at: tenant.subscription_starts_at || null,
          subscription_ends_at: tenant.subscription_ends_at || null,
          is_active: tenant.is_active,
        }),
      });
      await refreshData();
    } finally {
      setSavingSubscriptionId(null);
    }
  };

  const updateLocalTenant = (tenantId: number, patch: Partial<Tenant>) => {
    setTenants((prev) => prev.map((tenant) => (tenant.id === tenantId ? { ...tenant, ...patch } : tenant)));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold text-black">Super Admin Dashboard</h1>
        <p className="text-neutral-600 mt-1">Manage tenant subscriptions, admins, and account health</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">Tenants</p>
              <Building2 className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total_tenants}</p>
          </div>
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">Active Subs</p>
              <CreditCard className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.active_subscriptions}</p>
          </div>
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">Expiring Soon</p>
              <AlertTriangle className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.expiring_soon}</p>
          </div>
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">MRR</p>
              <CreditCard className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-bold mt-2">${stats.monthly_recurring_revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">Tenant Admins</p>
              <Users className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.tenant_admins}</p>
          </div>
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">Super Admins</p>
              <Users className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.super_admins}</p>
          </div>
        </div>
      )}

      <form onSubmit={createTenant} className="bg-white border border-neutral-200 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <input
          required
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Tenant name"
          className="px-3 py-2 border border-neutral-300"
        />
        <input
          value={form.slug}
          onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          placeholder="Tenant slug"
          className="px-3 py-2 border border-neutral-300"
        />
        <input
          required
          value={form.admin_name}
          onChange={(e) => setForm((prev) => ({ ...prev, admin_name: e.target.value }))}
          placeholder="Admin name"
          className="px-3 py-2 border border-neutral-300"
        />
        <input
          required
          type="email"
          value={form.admin_email}
          onChange={(e) => setForm((prev) => ({ ...prev, admin_email: e.target.value }))}
          placeholder="Admin email"
          className="px-3 py-2 border border-neutral-300"
        />
        <input
          required
          type="password"
          value={form.admin_password}
          onChange={(e) => setForm((prev) => ({ ...prev, admin_password: e.target.value }))}
          placeholder="Admin password"
          className="px-3 py-2 border border-neutral-300"
        />
        <select
          value={form.subscription_plan}
          onChange={(e) => setForm((prev) => ({ ...prev, subscription_plan: e.target.value }))}
          className="px-3 py-2 border border-neutral-300"
        >
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select
          value={form.subscription_status}
          onChange={(e) => setForm((prev) => ({ ...prev, subscription_status: e.target.value }))}
          className="px-3 py-2 border border-neutral-300"
        >
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="past_due">Past Due</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.monthly_price}
          onChange={(e) => setForm((prev) => ({ ...prev, monthly_price: e.target.value }))}
          placeholder="Monthly price"
          className="px-3 py-2 border border-neutral-300"
        />
        <input
          type="number"
          min="1"
          value={form.max_users}
          onChange={(e) => setForm((prev) => ({ ...prev, max_users: e.target.value }))}
          placeholder="Max users"
          className="px-3 py-2 border border-neutral-300"
        />
        <input
          type="number"
          min="1"
          value={form.max_products}
          onChange={(e) => setForm((prev) => ({ ...prev, max_products: e.target.value }))}
          placeholder="Max products"
          className="px-3 py-2 border border-neutral-300"
        />
        <input
          type="date"
          value={form.subscription_starts_at}
          onChange={(e) => setForm((prev) => ({ ...prev, subscription_starts_at: e.target.value }))}
          className="px-3 py-2 border border-neutral-300"
        />
        <input
          type="date"
          value={form.subscription_ends_at}
          onChange={(e) => setForm((prev) => ({ ...prev, subscription_ends_at: e.target.value }))}
          className="px-3 py-2 border border-neutral-300"
        />
        <button
          type="submit"
          disabled={creating}
          className="md:col-span-2 lg:col-span-5 inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Creating...' : 'Create Tenant'}
        </button>
      </form>

      <div className="bg-white border border-neutral-200">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tenant Subscriptions</h2>
          <button onClick={refreshData} className="inline-flex items-center gap-2 px-3 py-2 border border-neutral-300">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Users</th>
              <th className="px-4 py-3 text-left">Products</th>
              <th className="px-4 py-3 text-left">Ends</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-b border-neutral-200">
                <td className="px-4 py-3">{tenant.name}</td>
                <td className="px-4 py-3">{tenant.slug}</td>
                <td className="px-4 py-3">
                  <select
                    value={tenant.subscription_plan}
                    onChange={(e) => updateLocalTenant(tenant.id, { subscription_plan: e.target.value })}
                    className="px-2 py-1 border border-neutral-300"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={tenant.subscription_status}
                    onChange={(e) => updateLocalTenant(tenant.id, { subscription_status: e.target.value as Tenant['subscription_status'] })}
                    className="px-2 py-1 border border-neutral-300"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="past_due">Past Due</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tenant.monthly_price}
                    onChange={(e) => updateLocalTenant(tenant.id, { monthly_price: Number(e.target.value) })}
                    className="px-2 py-1 border border-neutral-300 w-24"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    value={tenant.max_users}
                    onChange={(e) => updateLocalTenant(tenant.id, { max_users: Number(e.target.value) })}
                    className="px-2 py-1 border border-neutral-300 w-20"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    value={tenant.max_products}
                    onChange={(e) => updateLocalTenant(tenant.id, { max_products: Number(e.target.value) })}
                    className="px-2 py-1 border border-neutral-300 w-24"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={tenant.subscription_ends_at ? tenant.subscription_ends_at.slice(0, 10) : ''}
                    onChange={(e) => updateLocalTenant(tenant.id, { subscription_ends_at: e.target.value || null })}
                    className="px-2 py-1 border border-neutral-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateTenantSubscription(tenant)}
                      className="inline-flex items-center gap-1 text-blue-700"
                      disabled={savingSubscriptionId === tenant.id}
                    >
                      <Save className="w-4 h-4" />
                      {savingSubscriptionId === tenant.id ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => deleteTenant(tenant.id)} className="inline-flex items-center gap-1 text-red-600">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
}
