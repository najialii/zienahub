'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  CreditCard, 
  AlertTriangle, 
  Building2, 
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  RefreshCw
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  subscription_plan: string;
  subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled';
  monthly_price: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  subscription_ends_at?: string | null;
  created_at: string;
}

interface DashboardStats {
  total_tenants: number;
  active_subscriptions: number;
  expiring_soon: number;
  monthly_recurring_revenue: number;
  tenant_admins: number;
  super_admins: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/dashboard`, {
        headers: authHeaders(),
      });
      const result = await response.json();
      setStats(result.data || null);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchRecentTenants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/tenants`, {
        headers: authHeaders(),
      });
      const result = await response.json();
      setRecentTenants((result.data || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchDashboard(), fetchRecentTenants()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchDashboard(), fetchRecentTenants()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingCount = recentTenants.filter(t => t.verification_status === 'pending').length;
  const trialCount = recentTenants.filter(t => t.subscription_status === 'trial').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor platform performance and vendor activity</p>
        </div>
        <button 
          onClick={refreshData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-200 dark:bg-emerald-800 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                ${stats.monthly_recurring_revenue.toLocaleString()}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">From {stats.active_subscriptions} active subscriptions</p>
            </div>
          </div>

          {/* Total Vendors */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-200 dark:bg-blue-800 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>+8.2%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Vendors</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{stats.total_tenants}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{stats.active_subscriptions} active, {trialCount} on trial</p>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-200 dark:bg-purple-800 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>+5.1%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Active Subscriptions</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{stats.active_subscriptions}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                {((stats.active_subscriptions / stats.total_tenants) * 100).toFixed(1)}% conversion rate
              </p>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-xl p-6 border border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-200 dark:bg-amber-800 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-300" />
              </div>
              {stats.expiring_soon > 0 && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Action needed</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Expiring Soon</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">{stats.expiring_soon}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Subscriptions ending within 7 days</p>
            </div>
          </div>

          {/* Tenant Admins */}
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-cyan-200 dark:bg-cyan-800 p-3 rounded-lg">
                <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-300" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Vendor Admins</p>
              <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100 mt-1">{stats.tenant_admins}</p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2">Managing vendor accounts</p>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 rounded-xl p-6 border border-rose-200 dark:border-rose-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-rose-200 dark:bg-rose-800 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-rose-600 dark:text-rose-300" />
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Review needed</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Pending Approvals</p>
              <p className="text-3xl font-bold text-rose-900 dark:text-rose-100 mt-1">{pendingCount}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">Vendors awaiting verification</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => router.push(`/${locale}/super-admin/vendors`)}
          className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold text-lg">Manage Vendors</h3>
          <p className="text-sm text-muted-foreground mt-1">View and manage all vendor accounts</p>
        </button>

        <button
          onClick={() => router.push(`/${locale}/super-admin/products`)}
          className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500/10 p-3 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-lg">Products</h3>
          <p className="text-sm text-muted-foreground mt-1">Browse all platform products</p>
        </button>

        <button
          onClick={() => router.push(`/${locale}/super-admin/categories`)}
          className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-500/10 p-3 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-lg">Categories</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage product categories</p>
        </button>

        <button
          onClick={() => router.push(`/${locale}/super-admin/settings`)}
          className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-emerald-500/10 p-3 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-lg">Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">Platform configuration</p>
        </button>
      </div>

      {/* Recent Vendors */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Vendors</h2>
              <p className="text-sm text-muted-foreground mt-1">Latest vendor registrations</p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/super-admin/vendors`)}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>
        </div>
        <div className="divide-y">
          {recentTenants.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No vendors yet</p>
            </div>
          ) : (
            recentTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/${locale}/super-admin/vendors/${tenant.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{tenant.name}</h3>
                      <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">${tenant.monthly_price}/mo</p>
                      <p className="text-xs text-muted-foreground capitalize">{tenant.subscription_plan}</p>
                    </div>
                    {tenant.verification_status === 'pending' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 rounded text-xs">
                        <Clock className="w-3 h-3" />
                        Pending
                      </div>
                    )}
                    {tenant.verification_status === 'approved' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 rounded text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </div>
                    )}
                    {tenant.subscription_status === 'trial' && (
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 rounded text-xs">
                        Trial
                      </div>
                    )}
                    {tenant.subscription_status === 'active' && (
                      <div className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 rounded text-xs">
                        Active
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
