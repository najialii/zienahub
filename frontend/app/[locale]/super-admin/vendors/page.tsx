'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { RefreshCw, Save, Trash2, CheckCircle, XCircle, Clock, ChevronRight, Plus, Search, Filter, Download, Users, Store, TrendingUp, AlertCircle } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled';
  monthly_fee: number;
  pricing_tier_id: number | null;
  pricing_tier?: {
    id: number;
    name: string;
    monthly_fee: number;
  };
  effective_monthly_fee: number;
  max_users: number;
  max_products: number;
  subscription_starts_at?: string | null;
  subscription_ends_at?: string | null;
  is_active: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  users_count?: number;
  tenant_admins_count?: number;
}

const statusBadge = (status: Tenant['verification_status']) => {
  const config = {
    pending: {
      variant: 'secondary' as const,
      icon: <Clock className="w-3 h-3 mr-1" />,
      className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
    },
    approved: {
      variant: 'default' as const,
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
      className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
    },
    rejected: {
      variant: 'destructive' as const,
      icon: <XCircle className="w-3 h-3 mr-1" />,
      className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
    },
  };
  
  const { icon, className } = config[status];
  
  return (
    <Badge className={`inline-flex items-center ${className}`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function VendorsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [pricingTiers, setPricingTiers] = useState<Array<{ id: number; name: string; monthly_fee: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ tenantId: number; reason: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', admin_name: '', admin_email: '', admin_phone: '', admin_password: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'trial' | 'active' | 'past_due' | 'cancelled'>('all');

  const router = useRouter();
  const locale = useLocale();

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/tenants`, { headers: authHeaders() });
      const result = await res.json();
      setTenants(result.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPricingTiers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/pricing-tiers`, { headers: authHeaders() });
      const result = await res.json();
      setPricingTiers(result.data?.filter((t: any) => t.is_active) || []);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchTenants(), fetchPricingTiers()]);
    setRefreshing(false);
  };

  useEffect(() => {
    Promise.all([fetchTenants(), fetchPricingTiers()]).finally(() => setLoading(false));
  }, []);

  const approveTenant = async (id: number) => {
    setSavingId(id);
    try {
      await fetch(`${API_BASE_URL}/super-admin/tenants/${id}/approve`, {
        method: 'POST',
        headers: authHeaders(),
      });
      await refreshData();
    } finally {
      setSavingId(null);
    }
  };

  const rejectTenant = async () => {
    if (!rejectModal) return;
    setSavingId(rejectModal.tenantId);
    try {
      await fetch(`${API_BASE_URL}/super-admin/tenants/${rejectModal.tenantId}/reject`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ rejection_reason: rejectModal.reason }),
      });
      setRejectModal(null);
      await refreshData();
    } finally {
      setSavingId(null);
    }
  };

  const deleteTenant = async (id: number) => {
    if (!confirm('Delete this tenant?')) return;
    await fetch(`${API_BASE_URL}/super-admin/tenants/${id}`, { method: 'DELETE', headers: authHeaders() });
    await refreshData();
  };

  const createTenant = async () => {
    setCreateError('');
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/tenants`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...createForm, admin_password: createForm.admin_password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstErr = data.errors ? Object.values(data.errors)[0] as string[] : null;
        throw new Error(firstErr?.[0] || data.message || 'Failed to create tenant');
      }
      setShowCreateModal(false);
      setCreateForm({ name: '', admin_name: '', admin_email: '', admin_phone: '', admin_password: '' });
      await refreshData();
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  let displayed = activeTab === 'pending'
    ? tenants.filter((t) => t.verification_status === 'pending')
    : tenants;

  // Apply search filter
  if (searchQuery) {
    displayed = displayed.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply status filter
  if (filterStatus !== 'all') {
    displayed = displayed.filter((t) => t.subscription_status === filterStatus);
  }

  const pendingCount = tenants.filter((t) => t.verification_status === 'pending').length;
  const activeCount = tenants.filter((t) => t.subscription_status === 'active').length;
  const trialCount = tenants.filter((t) => t.subscription_status === 'trial').length;
  const totalRevenue = tenants.reduce((sum, t) => sum + (t.subscription_status === 'active' ? (t.effective_monthly_fee || 0) : 0), 0);

  // Define columns for DataTable
  const columns = React.useMemo(() => {
    const baseColumns = [
      {
        header: 'Name',
        cell: (tenant: Tenant) => (
          <button
            onClick={() => router.push(`/${locale}/super-admin/vendors/${tenant.id}`)}
            className="flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
          >
            {tenant.name} <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </button>
        ),
      },
      {
        header: 'Slug',
        cell: (tenant: Tenant) => (
          <span className="text-xs text-muted-foreground">{tenant.slug}</span>
        ),
      },
      {
        header: 'Verification',
        cell: (tenant: Tenant) => statusBadge(tenant.verification_status),
      },
    ];

    if (activeTab === 'all') {
      baseColumns.push(
        {
          header: 'Pricing',
          cell: (tenant: Tenant) => (
            <div className="text-xs space-y-0.5">
              {tenant.pricing_tier ? (
                <>
                  <div className="font-medium text-blue-600">{tenant.pricing_tier.name}</div>
                  <div className="text-muted-foreground">${Number(tenant.effective_monthly_fee || 0).toFixed(2)}/mo</div>
                </>
              ) : (
                <>
                  <div className="font-medium text-neutral-700">Custom</div>
                  <div className="text-muted-foreground">${Number(tenant.monthly_fee || 0).toFixed(2)}/mo</div>
                </>
              )}
            </div>
          ),
        },
        {
          header: 'Status',
          cell: (tenant: Tenant) => (
            <Badge className={`${
              tenant.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
              tenant.subscription_status === 'trial' ? 'bg-blue-100 text-blue-700' :
              tenant.subscription_status === 'past_due' ? 'bg-red-100 text-red-700' :
              'bg-neutral-100 text-neutral-700'
            }`}>
              {tenant.subscription_status}
            </Badge>
          ),
        },
        {
          header: 'Users',
          cell: (tenant: Tenant) => (
            <div className="text-xs text-muted-foreground">
              {tenant.users_count || 0}
            </div>
          ),
        },
        {
          header: 'Expires',
          cell: (tenant: Tenant) => (
            <div className="text-xs text-muted-foreground">
              {tenant.subscription_ends_at 
                ? new Date(tenant.subscription_ends_at).toLocaleDateString()
                : '—'
              }
            </div>
          ),
        }
      );
    }

    baseColumns.push({
      header: <div className="text-right">Actions</div>,
      cell: (tenant: Tenant) => (
        <div className="flex items-center justify-end gap-2">
          {tenant.verification_status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  approveTenant(tenant.id);
                }}
                disabled={savingId === tenant.id}
                className="h-7 text-xs bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setRejectModal({ tenantId: tenant.id, reason: '' });
                }}
                className="h-7 text-xs"
              >
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/${locale}/super-admin/vendors/${tenant.id}`);
            }}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              deleteTenant(tenant.id);
            }}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right',
    });

    return baseColumns;
  }, [activeTab, savingId, locale, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all vendor accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Add Vendor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Vendors</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{tenants.length}</p>
            </div>
            <div className="bg-blue-200 dark:bg-blue-800 p-3 rounded-lg">
              <Store className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Subscriptions</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{activeCount}</p>
            </div>
            <div className="bg-green-200 dark:bg-green-800 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-xl p-6 border border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Approval</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-2">{pendingCount}</p>
            </div>
            <div className="bg-amber-200 dark:bg-amber-800 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-300" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Monthly Revenue</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">${totalRevenue.toFixed(0)}</p>
            </div>
            <div className="bg-purple-200 dark:bg-purple-800 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-xl border shadow-sm p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="transition-all"
            >
              All Vendors
              <Badge variant="secondary" className="ml-2">{tenants.length}</Badge>
            </Button>
            <Button
              variant={activeTab === 'pending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('pending')}
              className="transition-all"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Pending
              {pendingCount > 0 && <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>}
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {activeTab === 'all' && (
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={displayed}
          emptyMessage={
            searchQuery || filterStatus !== 'all'
              ? 'No vendors match your filters'
              : activeTab === 'pending'
              ? 'No pending applications'
              : 'No vendors found'
          }
        />
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-md border animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-destructive/10 p-2 rounded-lg">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg">Reject Vendor Application</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this vendor application. This will be sent to the applicant.
            </p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Enter rejection reason (optional)"
              className="w-full border rounded-lg p-3 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
            <div className="flex gap-3 mt-6">
              <Button
                variant="destructive"
                onClick={rejectTenant}
                disabled={savingId !== null}
                className="flex-1"
              >
                {savingId !== null ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setRejectModal(null)}
                disabled={savingId !== null}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-5 border animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Add New Vendor</h3>
            </div>
            
            {createError && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}
            
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Store Name', type: 'text', placeholder: 'e.g., Elegant Flowers' },
                { key: 'admin_name', label: 'Admin Name', type: 'text', placeholder: 'e.g., John Doe' },
                { key: 'admin_email', label: 'Admin Email', type: 'email', placeholder: 'admin@example.com' },
                { key: 'admin_phone', label: 'Admin Phone', type: 'tel', placeholder: '+1234567890 (optional)' },
                { key: 'admin_password', label: 'Admin Password', type: 'password', placeholder: 'Minimum 8 characters' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-2">{label}</label>
                  <Input
                    type={type}
                    value={(createForm as any)[key]}
                    onChange={(e) => setCreateForm({ ...createForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="h-10"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                onClick={createTenant}
                disabled={creating || !createForm.name || !createForm.admin_email || !createForm.admin_password}
                className="flex-1"
              >
                {creating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Vendor
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError('');
                  setCreateForm({ name: '', admin_name: '', admin_email: '', admin_phone: '', admin_password: '' });
                }}
                disabled={creating}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
