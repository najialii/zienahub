'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  TrendingUp, TrendingDown, ShoppingBasket, DollarSign, Users, 
  Loader2, AlertCircle, RefreshCw, Printer, Download, 
  ArrowUpRight, ArrowDownRight, Package, Target, Award,
  Calendar, BarChart3, PieChart
} from 'lucide-react';
import SARSymbol from '@/components/SARSymbol';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface TimeSeriesData {
  period: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  total_quantity: number;
  total_revenue: number;
}

interface CategoryData {
  name: string;
  revenue: number;
  percentage: number;
}

interface AnalyticsData {
  overview: {
    total_revenue: number;
    revenue_change: number;
    total_orders: number;
    order_change: number;
    avg_order_value: number;
    avg_order_value_change: number;
    conversion_rate: number;
    total_customers: number;
    new_customers: number;
  };
  revenue: {
    time_series: TimeSeriesData[];
    total_revenue: number;
  };
  products: {
    top_selling: TopProduct[];
  };
  categories: {
    by_revenue: CategoryData[];
  };
  customers: {
    avg_lifetime_value: number;
    repeat_customer_rate: number;
  };
}

const defaultAnalytics: AnalyticsData = {
  overview: {
    total_revenue: 0, revenue_change: 0, total_orders: 0, order_change: 0,
    avg_order_value: 0, avg_order_value_change: 0, conversion_rate: 0,
    total_customers: 0, new_customers: 0,
  },
  revenue: { time_series: [], total_revenue: 0 },
  products: { top_selling: [] },
  categories: { by_revenue: [] },
  customers: { avg_lifetime_value: 0, repeat_customer_rate: 0 },
};

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>(defaultAnalytics);
  const [period, setPeriod] = useState('30');
  const [error, setError] = useState('');

  const periodLabels: Record<string, string> = {
    '7': 'Last 7 Days',
    '30': 'Last 30 Days', 
    '90': 'Last 90 Days',
    '365': 'Last Year'
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/analytics/dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to load analytics');

      const result = await response.json();
      
      if (result.success && result.data) {
        setData({
          overview: { ...defaultAnalytics.overview, ...result.data.overview },
          revenue: { 
            time_series: Array.isArray(result.data.revenue?.time_series) ? result.data.revenue.time_series : [],
            total_revenue: result.data.revenue?.total_revenue || 0,
          },
          products: {
            top_selling: Array.isArray(result.data.products?.top_selling) ? result.data.products.top_selling : [],
          },
          categories: {
            by_revenue: Array.isArray(result.data.categories?.by_revenue) ? result.data.categories.by_revenue : [],
          },
          customers: { ...defaultAnalytics.customers, ...result.data.customers },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period, locale, router]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Prepare CSV data
    const csvRows = [];
    
    // Header
    csvRows.push('Zeina Analytics Report');
    csvRows.push(`Generated: ${new Date().toLocaleString()}`);
    csvRows.push(`Period: ${periodLabels[period]}`);
    csvRows.push('');
    
    // Overview metrics
    csvRows.push('OVERVIEW METRICS');
    csvRows.push('Metric,Value,Change (%)');
    csvRows.push(`Total Revenue,${overview.total_revenue},${overview.revenue_change}`);
    csvRows.push(`Total Orders,${overview.total_orders},${overview.order_change}`);
    csvRows.push(`Avg Order Value,${overview.avg_order_value},${overview.avg_order_value_change}`);
    csvRows.push(`Total Customers,${overview.total_customers},-`);
    csvRows.push(`New Customers,${overview.new_customers},-`);
    csvRows.push('');
    
    // Top Products
    csvRows.push('TOP PRODUCTS');
    csvRows.push('Rank,Product Name,Units Sold,Revenue');
    products.top_selling.forEach((product, idx) => {
      csvRows.push(`${idx + 1},"${product.name}",${product.total_quantity},${product.total_revenue}`);
    });
    csvRows.push('');
    
    // Categories
    csvRows.push('CATEGORY PERFORMANCE');
    csvRows.push('Category,Revenue,Percentage');
    categories.by_revenue.forEach((cat) => {
      csvRows.push(`"${cat.name}",${cat.revenue},${cat.percentage}`);
    });
    csvRows.push('');
    
    // Revenue Time Series
    csvRows.push('REVENUE TREND');
    csvRows.push('Period,Revenue,Orders');
    timeSeries.forEach((item) => {
      csvRows.push(`"${item.period}",${item.revenue},${item.orders}`);
    });
    
    // Create and download CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      period: periodLabels[period],
      ...data
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (v: number) => Math.round(v || 0).toLocaleString();
  const pct = (v: number) => (v || 0).toFixed(1);

  // Business insights
  const getBusinessInsights = () => {
    const insights: { type: 'success' | 'warning' | 'info'; message: string }[] = [];
    const { overview, customers } = data;
    
    if (overview.revenue_change > 10) {
      insights.push({ type: 'success', message: `Revenue is up ${pct(overview.revenue_change)}% - Great performance!` });
    } else if (overview.revenue_change < -10) {
      insights.push({ type: 'warning', message: `Revenue dropped ${pct(Math.abs(overview.revenue_change))}% - Consider promotions` });
    }
    
    if (customers.repeat_customer_rate > 30) {
      insights.push({ type: 'success', message: `Strong customer loyalty at ${pct(customers.repeat_customer_rate)}% repeat rate` });
    } else if (customers.repeat_customer_rate < 15) {
      insights.push({ type: 'warning', message: 'Low repeat rate - Focus on customer retention' });
    }
    
    if (overview.avg_order_value > 100) {
      insights.push({ type: 'info', message: `Healthy AOV at ${fmt(overview.avg_order_value)} ر.س` });
    }
    
    if (overview.new_customers > 0) {
      insights.push({ type: 'info', message: `${overview.new_customers} new customers acquired this period` });
    }
    
    return insights.length > 0 ? insights : [{ type: 'info', message: 'Collecting more data for insights...' }];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900">Error Loading Analytics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button onClick={fetchAnalytics} className="mt-3 flex items-center gap-2 text-sm text-red-700 hover:text-red-900">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { overview, revenue, products, categories, customers } = data;
  const timeSeries = revenue.time_series || [];
  const maxRevenue = timeSeries.length > 0 ? Math.max(...timeSeries.map(d => d.revenue || 0), 1) : 1;
  const insights = getBusinessInsights();

  return (
    <div ref={reportRef} className="space-y-6 print:space-y-4">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #analytics-report, #analytics-report * { visibility: visible; }
          #analytics-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div id="analytics-report" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {periodLabels[period]} Report
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 no-print">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <div className="relative group">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors" title="Export">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-50 flex items-center gap-2 rounded-t-lg"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Export as CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 rounded-b-lg"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Export as JSON
              </button>
            </div>
          </div>
          <button onClick={handlePrint} className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm" title="Print">
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Business Insights */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-600" /> Business Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, idx) => (
            <div key={idx} className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
              insight.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
              insight.type === 'warning' ? 'bg-amber-50 text-amber-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {insight.type === 'success' ? <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
               insight.type === 'warning' ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
               <Award className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              {insight.message}
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={
            <span className="flex items-center gap-1">
              {fmt(overview.total_revenue)} <SARSymbol className="w-5 h-5" />
            </span>
          }
          change={overview.revenue_change}
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="Orders"
          value={overview.total_orders.toString()}
          change={overview.order_change}
          icon={ShoppingBasket}
          color="blue"
        />
        <KPICard
          title="Avg Order Value"
          value={
            <span className="flex items-center gap-1">
              {fmt(overview.avg_order_value)} <SARSymbol className="w-5 h-5" />
            </span>
          }
          change={overview.avg_order_value_change}
          icon={TrendingUp}
          color="violet"
        />
        <KPICard
          title="Customers"
          value={overview.total_customers.toString()}
          subtitle={`+${overview.new_customers} new`}
          icon={Users}
          color="amber"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> Revenue Trend
          </h2>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            Total: {fmt(revenue.total_revenue)} <SARSymbol className="w-4 h-4" />
          </span>
        </div>
        {timeSeries.length > 0 ? (
          <div className="h-64 flex items-end gap-1">
            {timeSeries.map((item, idx) => {
              const height = maxRevenue > 0 ? ((item.revenue || 0) / maxRevenue) * 200 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded mb-1 whitespace-nowrap flex items-center gap-1">
                    {fmt(item.revenue)} <SARSymbol className="w-3 h-3 brightness-0 invert" />
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t hover:from-emerald-700 hover:to-emerald-500 transition-all cursor-pointer"
                    style={{ height: Math.max(height, 4) }}
                  />
                  <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{item.period}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
        )}
      </div>

      {/* Products & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" /> Top Products
          </h2>
          {products.top_selling.length > 0 ? (
            <div className="space-y-3">
              {products.top_selling.slice(0, 5).map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold`}
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.total_quantity} units sold</p>
                  </div>
                  <p className="font-semibold text-gray-900 flex items-center gap-1">
                    {fmt(product.total_revenue)} <SARSymbol className="w-4 h-4" />
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">No sales data yet</div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-violet-600" /> Category Performance
          </h2>
          {categories.by_revenue.length > 0 ? (
            <div className="space-y-4">
              {categories.by_revenue.slice(0, 5).map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      {fmt(cat.revenue)} <SARSymbol className="w-3 h-3" /> ({pct(cat.percentage)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${cat.percentage || 0}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">No category data</div>
          )}
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="New Customers"
          value={overview.new_customers}
          subtitle="This period"
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Repeat Rate"
          value={`${pct(customers.repeat_customer_rate)}%`}
          subtitle="Customer loyalty"
          icon={Award}
          color="blue"
        />
        <MetricCard
          title="Lifetime Value"
          value={
            <span className="flex items-center gap-1">
              {fmt(customers.avg_lifetime_value)} <SARSymbol className="w-6 h-6" />
            </span>
          }
          subtitle="Avg per customer"
          icon={DollarSign}
          color="violet"
        />
      </div>

      {/* Report Footer */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} &bull; Zeina Analytics
      </div>
    </div>
  );
}

function KPICard({ title, value, change, subtitle, icon: Icon, color }: {
  title: string;
  value: string | React.ReactNode;
  change?: number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'violet' | 'amber';
}) {
  const colors = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    violet: 'from-violet-500 to-purple-600',
    amber: 'from-amber-500 to-orange-600',
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors[color]} opacity-10 rounded-bl-full`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: string | number | React.ReactNode;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'violet';
}) {
  const bgColors = {
    emerald: 'bg-emerald-50 border-emerald-100',
    blue: 'bg-blue-50 border-blue-100',
    violet: 'bg-violet-50 border-violet-100',
  };
  const iconColors = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    violet: 'text-violet-600',
  };
  
  return (
    <div className={`${bgColors[color]} border rounded-xl p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}