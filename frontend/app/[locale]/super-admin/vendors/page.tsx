'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Save, Trash2 } from 'lucide-react';

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

export default function Vendor() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSubscriptionId, setSavingSubscriptionId] = useState<number | null>(null);

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchTenants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/tenants`, {
        headers: authHeaders(),
      });
      const result = await response.json();
      setTenants(result.data || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchTenants();
    setRefreshing(false);
  };

  useEffect(() => {
    const load = async () => {
      await fetchTenants();
      setLoading(false);
    };
    load();
  }, []);

  const updateLocalTenant = (tenantId: number, patch: Partial<Tenant>) => {
    setTenants((prev) => prev.map((tenant) => (tenant.id === tenantId ? { ...tenant, ...patch } : tenant)));
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

  const deleteTenant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;
    await fetch(`${API_BASE_URL}/super-admin/tenants/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await refreshData();
  };

  if (loading) return <div className="p-6 text-neutral-600">Loading tenants...</div>;

  return (
    <div className="bg-white border border-neutral-200">
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black">Tenant Subscriptions</h2>
        <button 
          onClick={refreshData} 
          className="inline-flex items-center gap-2 px-3 py-2 border border-neutral-300 hover:bg-neutral-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Name</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Price</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Users</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Ends</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3 font-medium">{tenant.name}</td>
                <td className="px-4 py-3 text-neutral-600">{tenant.slug}</td>
                <td className="px-4 py-3">
                  <select
                    value={tenant.subscription_plan}
                    onChange={(e) => updateLocalTenant(tenant.id, { subscription_plan: e.target.value })}
                    className="px-2 py-1 border border-neutral-300 rounded text-xs"
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
                    className="px-2 py-1 border border-neutral-300 rounded text-xs"
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
                    value={tenant.monthly_price}
                    onChange={(e) => updateLocalTenant(tenant.id, { monthly_price: Number(e.target.value) })}
                    className="px-2 py-1 border border-neutral-300 w-20 rounded text-xs"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={tenant.max_users}
                    onChange={(e) => updateLocalTenant(tenant.id, { max_users: Number(e.target.value) })}
                    className="px-2 py-1 border border-neutral-300 w-16 rounded text-xs"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={tenant.subscription_ends_at ? tenant.subscription_ends_at.slice(0, 10) : ''}
                    onChange={(e) => updateLocalTenant(tenant.id, { subscription_ends_at: e.target.value || null })}
                    className="px-2 py-1 border border-neutral-300 rounded text-xs"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => updateTenantSubscription(tenant)}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      disabled={savingSubscriptionId === tenant.id}
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteTenant(tenant.id)} 
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}