import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { adminReportService } from '../../services/adminReportService';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('en-IN').format(val || 0);
const formatPct = (val) => val != null ? (val * 100).toFixed(1) + '%' : '0%';

// Build start/end from preset key
const buildRange = (preset, custom) => {
  const now = new Date();
  const toISO = (d) => d.toISOString();
  const daysAgo = (n) => { const d = new Date(now); d.setHours(0,0,0,0); d.setDate(d.getDate() - n); return d; };
  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  switch (preset) {
    case 'today':         return { startDate: toISO(daysAgo(0)), endDate: toISO(endOfDay(now)) };
    case 'yesterday':     return { startDate: toISO(daysAgo(1)), endDate: toISO(endOfDay(daysAgo(1))) };
    case '7d':            return { startDate: toISO(daysAgo(7)), endDate: toISO(now) };
    case '30d':           return { startDate: toISO(daysAgo(30)), endDate: toISO(now) };
    case 'thisMonth':     return { startDate: toISO(startOfMonth(now)), endDate: toISO(now) };
    case 'lastMonth':     {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case 'thisYear':      return { startDate: toISO(new Date(now.getFullYear(), 0, 1)), endDate: toISO(now) };
    case 'custom':        return { startDate: custom.startDate, endDate: custom.endDate };
    default:              return { startDate: '', endDate: '' };
  }
};

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-soft-lg border text-[13px] font-semibold transition-all animate-fade-in
          ${t.type === 'success' ? 'bg-white border-success/30 text-success' : 'bg-white border-danger/30 text-danger-content'}`}>
          <span className="material-symbols-outlined text-[18px]">{t.type === 'success' ? 'check_circle' : 'error'}</span>
          {t.message}
          <button onClick={() => removeToast(t.id)} className="ml-2 opacity-50 hover:opacity-100 pointer-events-auto">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`bg-border/60 rounded-lg animate-pulse ${className}`} />
);
const SkeletonCard = () => (
  <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
    <Skeleton className="w-12 h-12 rounded-full" />
    <div className="flex-1"><Skeleton className="h-3 w-24 mb-2" /><Skeleton className="h-7 w-32" /></div>
  </div>
);
const SkeletonTable = () => (
  <div className="space-y-3 p-5">
    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
  </div>
);
const SkeletonChart = () => (
  <div className="h-[340px] flex items-end gap-2 p-6">
    {[60, 80, 55, 70, 90, 75, 85, 65, 78, 92, 60, 88].map((h, i) => (
      <div key={i} className="flex-1 bg-border/60 rounded-t-md animate-pulse" style={{ height: `${h}%` }} />
    ))}
  </div>
);

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, colorClass, bgClass, sub }) => (
  <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${bgClass}`}>
      <span className={`material-symbols-outlined text-[22px] ${colorClass}`}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-1 truncate">{title}</p>
      <p className="text-[22px] font-display font-bold text-text leading-none">{value}</p>
      {sub && <p className="text-[11px] text-text-muted mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── Date Range Picker ───────────────────────────────────────────────────────
function DateRangePicker({ preset, setPreset, customRange, setCustomRange }) {
  const [showCustom, setShowCustom] = useState(false);
  const presets = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'thisYear', label: 'This Year' },
    { key: 'custom', label: 'Custom Range' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="bg-surface border border-border rounded-xl shadow-sm flex items-center">
        <span className="material-symbols-outlined text-text-muted text-[18px] pl-3">calendar_today</span>
        <select
          value={preset}
          onChange={e => { setPreset(e.target.value); setShowCustom(e.target.value === 'custom'); }}
          className="bg-transparent text-[13px] font-semibold text-text px-3 py-2 focus:outline-none cursor-pointer"
        >
          {presets.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>
      {showCustom && (
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 shadow-sm">
          <input type="date" value={customRange.startDate} onChange={e => setCustomRange(p => ({ ...p, startDate: e.target.value }))}
            className="bg-transparent text-[13px] font-medium text-text focus:outline-none" />
          <span className="text-text-muted text-[13px]">→</span>
          <input type="date" value={customRange.endDate} onChange={e => setCustomRange(p => ({ ...p, endDate: e.target.value }))}
            className="bg-transparent text-[13px] font-medium text-text focus:outline-none" />
        </div>
      )}
    </div>
  );
}

// ─── Period Picker ───────────────────────────────────────────────────────────
const PeriodPicker = ({ value, onChange }) => (
  <div className="flex items-center bg-background border border-border rounded-xl overflow-hidden">
    {['daily', 'weekly', 'monthly'].map(p => (
      <button key={p} onClick={() => onChange(p)}
        className={`px-3 py-1.5 text-[12px] font-bold capitalize transition-colors ${value === p ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}>
        {p}
      </button>
    ))}
  </div>
);

// ─── Rating Bar ──────────────────────────────────────────────────────────────
const RatingBar = ({ stars, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] font-bold text-text-muted w-6 text-right">{stars}★</span>
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-[#FFB400] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[12px] font-bold text-text w-8 text-right">{count}</span>
    </div>
  );
};

// ─── Export Modal ────────────────────────────────────────────────────────────
function ExportModal({ isOpen, onClose, dateRange, onToast }) {
  const [type, setType] = useState('sales');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await adminReportService.exportReport({ ...dateRange, type });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_report.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onToast('success', 'Report exported successfully!');
      onClose();
    } catch {
      onToast('error', 'Failed to export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const REPORT_TYPES = [
    { value: 'sales', label: 'Sales & Revenue Report' },
    { value: 'orders', label: 'Orders Report' },
    { value: 'sellers', label: 'Seller Performance Report' },
    { value: 'products', label: 'Product Performance Report' },
    { value: 'customers', label: 'Customer Report' },
    { value: 'payments', label: 'Payment Report' },
    { value: 'refunds', label: 'Refunds & Cancellations' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-surface rounded-2xl shadow-soft-lg w-full max-w-md p-6 z-10 border border-border">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="font-display font-bold text-[20px] text-text">Export Report</h3>
            <p className="text-[13px] text-text-muted mt-0.5">Download a CSV of your selected report</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-1.5">Report Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-4 py-2.5 text-[13px] border border-border rounded-lg bg-background text-text focus:border-primary focus:outline-none">
              {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="bg-surface-sunken border border-border rounded-lg px-4 py-3 flex items-center gap-2 text-[12px] text-text-muted">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Report uses your currently selected date range. Format: CSV
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-[13px] font-semibold text-text-soft border border-border rounded-lg hover:bg-surface-sunken transition-colors">
            Cancel
          </button>
          <button onClick={handleExport} disabled={loading}
            className="px-5 py-2 text-[13px] font-bold text-white bg-primary hover:bg-primary-hover rounded-lg flex items-center gap-2 transition-colors shadow-brand disabled:opacity-60">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <span className="material-symbols-outlined text-[18px]">download</span>}
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ message = 'No data for this period.', onRetry }) => (
  <div className="py-16 flex flex-col items-center text-center gap-3">
    <div className="w-14 h-14 rounded-full bg-surface-sunken flex items-center justify-center mb-1">
      <span className="material-symbols-outlined text-[28px] text-text-muted">inbox</span>
    </div>
    <p className="text-[15px] font-semibold text-text">No data available</p>
    <p className="text-[13px] text-text-muted max-w-[260px]">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-2 px-4 py-2 text-[13px] font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
        Retry
      </button>
    )}
  </div>
);

// ─── Chart Tooltip ───────────────────────────────────────────────────────────
const ChartTooltipStyle = {
  borderRadius: '12px', border: '1px solid #E6E0D2',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#FFFFFF', fontSize: 12
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',   label: 'Overview',   icon: 'dashboard' },
  { id: 'revenue',    label: 'Revenue',    icon: 'payments' },
  { id: 'orders',     label: 'Orders',     icon: 'shopping_bag' },
  { id: 'sellers',    label: 'Sellers',    icon: 'store' },
  { id: 'products',   label: 'Products',   icon: 'inventory_2' },
  { id: 'categories', label: 'Categories', icon: 'category' },
  { id: 'customers',  label: 'Customers',  icon: 'group' },
  { id: 'payments',   label: 'Payments',   icon: 'credit_card' },
  { id: 'refunds',    label: 'Refunds',    icon: 'assignment_return' },
  { id: 'reviews',    label: 'Reviews',    icon: 'star' },
];

export default function AdminReportsPage() {
  // ── Date range state ──
  const [preset, setPreset] = useState('30d');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const dateRange = buildRange(preset, customRange);

  // ── UI state ──
  const [activeTab, setActiveTab] = useState('overview');
  const [exportOpen, setExportOpen] = useState(false);
  const [period, setPeriod] = useState('daily');
  const [toasts, setToasts] = useState([]);

  // ── Data state per tab ──
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState({ summary: {}, chartData: [] });
  const [sellersData, setSellersData] = useState({ data: [], total: 0, pages: 0 });
  const [productsData, setProductsData] = useState({ data: [], summary: {}, total: 0 });
  const [categoriesData, setCategoriesData] = useState({ data: [], total: 0 });
  const [customersData, setCustomersData] = useState(null);
  const [paymentsData, setPaymentsData] = useState(null);
  const [refundsData, setRefundsData] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);

  // ── Sellers search/sort ──
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerSort, setSellerSort] = useState('sales');
  const [sellerPage, setSellerPage] = useState(1);
  const SELLER_LIMIT = 25;

  // ── Products sort ──
  const [productSort, setProductSort] = useState('revenue');
  const [productPage, setProductPage] = useState(1);
  const PRODUCT_LIMIT = 25;

  // ── Toast helpers ──
  const addToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTab = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...dateRange, period };
      switch (activeTab) {
        case 'overview': {
          const r = await adminReportService.getOverview(params);
          setOverview(r.data);
          break;
        }
        case 'revenue': {
          const r = await adminReportService.getRevenue(params);
          setRevenueData(r.data || []);
          break;
        }
        case 'orders': {
          const r = await adminReportService.getOrders(params);
          setOrdersData({ summary: r.summary || {}, chartData: r.chartData || [] });
          break;
        }
        case 'sellers': {
          const r = await adminReportService.getSellers({ ...params, sort: sellerSort, page: sellerPage, limit: SELLER_LIMIT });
          setSellersData({ data: r.data || [], total: r.total || 0, pages: r.pages || 0 });
          break;
        }
        case 'products': {
          const r = await adminReportService.getProducts({ ...params, sort: productSort, page: productPage, limit: PRODUCT_LIMIT });
          setProductsData({ data: r.data || [], summary: r.summary || {}, total: r.total || 0 });
          break;
        }
        case 'categories': {
          const r = await adminReportService.getCategories(params);
          setCategoriesData({ data: r.data || [], total: r.total || 0 });
          break;
        }
        case 'customers': {
          const r = await adminReportService.getCustomers(params);
          setCustomersData(r.data);
          break;
        }
        case 'payments': {
          const r = await adminReportService.getPayments(params);
          setPaymentsData(r.data);
          break;
        }
        case 'refunds': {
          const r = await adminReportService.getRefunds(params);
          setRefundsData(r.data);
          break;
        }
        case 'reviews': {
          const r = await adminReportService.getReviews(params);
          setReviewsData(r.data);
          break;
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, preset, customRange, period, sellerSort, sellerPage, productSort, productPage]);

  useEffect(() => { fetchTab(); }, [fetchTab]);

  // Filter sellers by search
  const filteredSellers = (sellersData.data || []).filter(s =>
    !sellerSearch || s.name?.toLowerCase().includes(sellerSearch.toLowerCase()) || s.email?.toLowerCase().includes(sellerSearch.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pb-12 min-h-screen">
      {/* Toast notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} dateRange={dateRange} onToast={addToast} />

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase text-text-muted font-semibold mb-1">Admin Console</p>
          <h1 className="font-display text-[26px] font-semibold text-text flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary">bar_chart</span>Reports
          </h1>
          <p className="text-text-muted text-[13.5px]">Generate detailed reports and monitor VendorHub marketplace performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker preset={preset} setPreset={setPreset} customRange={customRange} setCustomRange={setCustomRange} />
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-[13px] transition-colors shadow-brand"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>Export Report
          </button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex overflow-x-auto border-b border-border mb-7 hide-scrollbar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setError(null); }}
            className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-bold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}>
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="bg-danger-bg border border-danger/20 rounded-xl px-5 py-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-danger-content">error</span>
            <span className="text-[13px] font-semibold text-danger-content">{error}</span>
          </div>
          <button onClick={fetchTab} className="text-[12px] font-bold text-danger-content underline underline-offset-2">Retry</button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : !overview ? null : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatCard title="Total Revenue" value={formatCurrency(overview.totalRevenue)} icon="payments" bgClass="bg-success/10" colorClass="text-success" sub="Gross paid orders" />
              <StatCard title="Total Orders" value={formatNumber(overview.totalOrders)} icon="shopping_bag" bgClass="bg-primary/10" colorClass="text-primary" sub="All statuses" />
              <StatCard title="Seller Earnings" value={formatCurrency(overview.sellerEarnings)} icon="account_balance_wallet" bgClass="bg-[#FFF8E7]" colorClass="text-[#E8A33D]" sub={`After ${overview.platformCommissionPct || 0}% commission`} />
              <StatCard title="Platform Commission" value={formatCurrency(overview.platformCommission)} icon="percent" bgClass="bg-info/10" colorClass="text-info" />
              <StatCard title="Avg. Order Value" value={formatCurrency(overview.avgOrderValue)} icon="receipt_long" bgClass="bg-surface-sunken" colorClass="text-text-soft" />
              <StatCard title="Total Refunds" value={formatCurrency(overview.totalRefunds)} icon="assignment_return" bgClass="bg-danger-bg" colorClass="text-danger-content" sub="Cancelled / returned items" />
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          REVENUE TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'revenue' && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-soft">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div>
              <h3 className="font-display font-bold text-[18px] text-text">Revenue Breakdown</h3>
              <p className="text-[13px] text-text-muted mt-0.5">Gross sales, refunds, and earnings over time</p>
            </div>
            <PeriodPicker value={period} onChange={setPeriod} />
          </div>
          {loading ? <SkeletonChart /> : revenueData.length === 0 ? <EmptyState message="No revenue data for this period." onRetry={fetchTab} /> : (
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0D2" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#948F82' }} axisLine={false} tickLine={false} tickMargin={8} />
                  <YAxis tick={{ fontSize: 11, fill: '#948F82' }} axisLine={false} tickLine={false} tickMargin={8} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <RechartsTooltip contentStyle={ChartTooltipStyle} formatter={v => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                  <Bar dataKey="grossSales" name="Gross Sales" fill="#E8A33D" radius={[4,4,0,0]} />
                  <Bar dataKey="sellerEarnings" name="Seller Earnings" fill="#1E2A47" radius={[4,4,0,0]} />
                  <Bar dataKey="refunds" name="Refunds" fill="#C1543C" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ORDERS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total',      val: ordersData.summary.total,      color: 'text-text' },
                  { label: 'Delivered',  val: ordersData.summary.delivered,   color: 'text-success' },
                  { label: 'Pending',    val: ordersData.summary.pending,     color: 'text-[#E8A33D]' },
                  { label: 'Processing', val: ordersData.summary.processing,  color: 'text-info' },
                  { label: 'Shipped',    val: ordersData.summary.shipped,     color: 'text-primary' },
                  { label: 'Cancelled',  val: ordersData.summary.cancelled,   color: 'text-danger-content' },
                  { label: 'Returned',   val: ordersData.summary.returned,    color: 'text-danger-content' },
                  { label: 'Refunded',   val: ordersData.summary.refunded,    color: 'text-text-soft' },
                ].map(s => (
                  <div key={s.label} className="bg-surface border border-border rounded-xl p-4 text-center shadow-sm">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">{s.label}</p>
                    <p className={`text-[22px] font-display font-bold mt-1 ${s.color}`}>{formatNumber(s.val)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-surface border border-border rounded-xl p-6 shadow-soft">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                  <h3 className="font-display font-bold text-[18px] text-text">Order Volume Trend</h3>
                  <PeriodPicker value={period} onChange={setPeriod} />
                </div>
                {ordersData.chartData?.length === 0 ? <EmptyState /> : (
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ordersData.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0D2" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#948F82' }} axisLine={false} tickLine={false} tickMargin={8} />
                        <YAxis tick={{ fontSize: 11, fill: '#948F82' }} axisLine={false} tickLine={false} tickMargin={8} />
                        <RechartsTooltip contentStyle={ChartTooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                        <Line type="monotone" dataKey="total" name="Total" stroke="#1E2A47" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#1E7A3E" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#C1543C" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SELLERS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sellers' && (
        <div className="bg-surface border border-border rounded-xl shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="font-display font-bold text-[18px] text-text">Seller Performance</h3>
              <p className="text-[13px] text-text-muted">{sellersData.total} sellers total</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-text-muted">search</span>
                <input value={sellerSearch} onChange={e => setSellerSearch(e.target.value)} placeholder="Search sellers..."
                  className="pl-9 pr-4 py-2 text-[13px] border border-border rounded-lg bg-background focus:border-primary focus:outline-none w-48" />
              </div>
              <select value={sellerSort} onChange={e => { setSellerSort(e.target.value); setSellerPage(1); }}
                className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background focus:outline-none">
                <option value="sales">Sort: Highest Sales</option>
                <option value="orders">Sort: Most Orders</option>
                <option value="earnings">Sort: Highest Earnings</option>
                <option value="products">Sort: Most Products</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? <SkeletonTable /> : (
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-background border-b border-border text-text-muted uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Seller</th>
                    <th className="px-5 py-4 text-right">Products</th>
                    <th className="px-5 py-4 text-right">Orders</th>
                    <th className="px-5 py-4 text-right">Gross Sales</th>
                    <th className="px-5 py-4 text-right">Commission</th>
                    <th className="px-5 py-4 text-right">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSellers.length === 0 ? (
                    <tr><td colSpan="6"><EmptyState message="No sellers match your search." /></td></tr>
                  ) : filteredSellers.map(seller => (
                    <tr key={seller._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-text">{seller.name}</p>
                        <p className="text-[11px] text-text-muted">{seller.email}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-text">{formatNumber(seller.products)}</td>
                      <td className="px-5 py-4 text-right font-medium text-text">{formatNumber(seller.orders)}</td>
                      <td className="px-5 py-4 text-right font-bold text-text">{formatCurrency(seller.grossSales)}</td>
                      <td className="px-5 py-4 text-right text-text-soft">{formatCurrency(seller.commission)}</td>
                      <td className="px-5 py-4 text-right font-bold text-success">{formatCurrency(seller.earnings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination */}
          {!loading && sellersData.pages > 1 && (
            <div className="px-5 py-4 border-t border-border flex items-center justify-between text-[12px] text-text-muted">
              <span>Showing page {sellerPage} of {sellersData.pages} ({formatNumber(sellersData.total)} sellers)</span>
              <div className="flex gap-2">
                <button onClick={() => setSellerPage(p => Math.max(1, p-1))} disabled={sellerPage === 1}
                  className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-surface-sunken transition-colors font-semibold">Prev</button>
                <button onClick={() => setSellerPage(p => Math.min(sellersData.pages, p+1))} disabled={sellerPage === sellersData.pages}
                  className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-surface-sunken transition-colors font-semibold">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PRODUCTS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="bg-danger-bg border border-danger/20 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-danger-content text-[20px]">warning</span>
              <div>
                <p className="text-[10px] font-bold text-danger-content uppercase tracking-wide">Out of Stock</p>
                <p className="font-display font-bold text-[20px] text-danger-content leading-none">{formatNumber(productsData.summary?.outOfStock)}</p>
              </div>
            </div>
            <div className="bg-surface-sunken border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-text-soft text-[20px]">inventory_2</span>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Low Stock</p>
                <p className="font-display font-bold text-[20px] text-text leading-none">{formatNumber(productsData.summary?.lowStock)}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl shadow-soft overflow-hidden">
            <div className="p-5 border-b border-border flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="font-display font-bold text-[18px] text-text">Top Products</h3>
                <p className="text-[13px] text-text-muted">{formatNumber(productsData.total)} total products</p>
              </div>
              <select value={productSort} onChange={e => { setProductSort(e.target.value); setProductPage(1); }}
                className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background focus:outline-none">
                <option value="revenue">Sort: Highest Revenue</option>
                <option value="sold">Sort: Most Sold</option>
                <option value="orders">Sort: Most Orders</option>
                <option value="rating">Sort: Highest Rated</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              {loading ? <SkeletonTable /> : (
                <table className="w-full text-left text-[13px] whitespace-nowrap">
                  <thead className="bg-background border-b border-border text-text-muted uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Seller</th>
                      <th className="px-5 py-4 text-right">Units Sold</th>
                      <th className="px-5 py-4 text-right">Orders</th>
                      <th className="px-5 py-4 text-right">Revenue</th>
                      <th className="px-5 py-4 text-center">Rating</th>
                      <th className="px-5 py-4 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {productsData.data?.length === 0 ? (
                      <tr><td colSpan="7"><EmptyState message="No product data for this period." /></td></tr>
                    ) : productsData.data?.map(prod => (
                      <tr key={prod._id} className="hover:bg-background/50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-text max-w-[180px] truncate">{prod.name}</td>
                        <td className="px-5 py-4 text-text-soft">{prod.seller}</td>
                        <td className="px-5 py-4 text-right font-medium">{formatNumber(prod.unitsSold)}</td>
                        <td className="px-5 py-4 text-right font-medium">{formatNumber(prod.orders)}</td>
                        <td className="px-5 py-4 text-right font-bold text-text">{formatCurrency(prod.revenue)}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-[#FFB400]">
                            <span className="material-symbols-outlined text-[15px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                            <span className="font-bold text-text">{prod.rating ? prod.rating.toFixed(1) : '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${prod.stock === 0 ? 'bg-danger-bg text-danger-content' : prod.stock <= 10 ? 'bg-[#FFF8E7] text-[#A86800]' : 'bg-success/10 text-success'}`}>
                            {prod.stock === 0 ? 'Out' : prod.stock <= 10 ? `Low (${prod.stock})` : prod.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {!loading && productsData.total > PRODUCT_LIMIT && (
              <div className="px-5 py-4 border-t border-border flex items-center justify-between text-[12px] text-text-muted">
                <span>Page {productPage} · {formatNumber(productsData.total)} products</span>
                <div className="flex gap-2">
                  <button onClick={() => setProductPage(p => Math.max(1, p-1))} disabled={productPage === 1}
                    className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-surface-sunken transition-colors font-semibold">Prev</button>
                  <button onClick={() => setProductPage(p => p+1)} disabled={productPage * PRODUCT_LIMIT >= productsData.total}
                    className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-surface-sunken transition-colors font-semibold">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CATEGORIES TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="bg-surface border border-border rounded-xl shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-bold text-[18px] text-text">Category Performance</h3>
            <p className="text-[13px] text-text-muted">{categoriesData.total} categories</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? <SkeletonTable /> : (
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-background border-b border-border text-text-muted uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4 text-right">Products</th>
                    <th className="px-5 py-4 text-right">Orders</th>
                    <th className="px-5 py-4 text-right">Units Sold</th>
                    <th className="px-5 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categoriesData.data?.length === 0 ? (
                    <tr><td colSpan="5"><EmptyState /></td></tr>
                  ) : categoriesData.data?.map(cat => (
                    <tr key={cat._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-text">{cat.name}</td>
                      <td className="px-5 py-4 text-right font-medium">{formatNumber(cat.products)}</td>
                      <td className="px-5 py-4 text-right font-medium">{formatNumber(cat.orders)}</td>
                      <td className="px-5 py-4 text-right font-medium">{formatNumber(cat.unitsSold)}</td>
                      <td className="px-5 py-4 text-right font-bold text-text">{formatCurrency(cat.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CUSTOMERS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : !customersData ? <EmptyState onRetry={fetchTab} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatCard title="Total Buyers" value={formatNumber(customersData.totalBuyers)} icon="group" bgClass="bg-primary/10" colorClass="text-primary" />
              <StatCard title="New Buyers (Period)" value={formatNumber(customersData.newBuyers)} icon="person_add" bgClass="bg-success/10" colorClass="text-success" />
              <StatCard title="Returning Buyers" value={formatNumber(customersData.returningBuyers)} icon="refresh" bgClass="bg-info/10" colorClass="text-info" />
              <StatCard title="Buyers With Orders" value={formatNumber(customersData.buyersWithOrders)} icon="shopping_bag" bgClass="bg-[#FFF8E7]" colorClass="text-[#E8A33D]" />
              <StatCard title="Avg. Orders / Buyer" value={customersData.avgOrdersPerBuyer?.toFixed(1)} icon="receipt_long" bgClass="bg-surface-sunken" colorClass="text-text-soft" />
              <StatCard title="Avg. Customer Spend" value={formatCurrency(customersData.avgCustomerSpending)} icon="payments" bgClass="bg-success/10" colorClass="text-success" />
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PAYMENTS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : !paymentsData ? <EmptyState onRetry={fetchTab} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatCard title="Total Payment Volume" value={formatCurrency(paymentsData.totalVolume)} icon="account_balance" bgClass="bg-primary/10" colorClass="text-primary" />
              <StatCard title="Successful Payments" value={formatCurrency(paymentsData.successful)} icon="check_circle" bgClass="bg-success/10" colorClass="text-success" />
              <StatCard title="Pending Payments" value={formatCurrency(paymentsData.pending)} icon="pending" bgClass="bg-[#FFF8E7]" colorClass="text-[#E8A33D]" />
              <StatCard title="Failed Payments" value={formatCurrency(paymentsData.failed)} icon="cancel" bgClass="bg-danger-bg" colorClass="text-danger-content" />
              <StatCard title="Refunded Amount" value={formatCurrency(paymentsData.refunded)} icon="assignment_return" bgClass="bg-surface-sunken" colorClass="text-text-soft" />
            </div>
          )}
          <div className="bg-surface-sunken border border-border rounded-xl px-5 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[18px] text-text-muted mt-0.5">shield</span>
            <p className="text-[12.5px] text-text-muted leading-relaxed">
              Payment details are shown for reporting purposes only. No sensitive data (card numbers, CVV, credentials) is stored or displayed. Transaction IDs are safe Razorpay references only.
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          REFUNDS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'refunds' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : !refundsData ? <EmptyState onRetry={fetchTab} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatCard title="Cancelled Orders" value={formatNumber(refundsData.cancelledOrders)} icon="cancel" bgClass="bg-danger-bg" colorClass="text-danger-content" />
              <StatCard title="Returned Orders" value={formatNumber(refundsData.returnedOrders)} icon="undo" bgClass="bg-surface-sunken" colorClass="text-text-soft" />
              <StatCard title="Refunded Orders" value={formatNumber(refundsData.refundedOrders)} icon="assignment_return" bgClass="bg-info/10" colorClass="text-info" />
              <StatCard title="Total Refund Amount" value={formatCurrency(refundsData.refundAmount)} icon="money_off" bgClass="bg-danger-bg" colorClass="text-danger-content" />
              <StatCard title="Cancellation Rate" value={formatPct(refundsData.cancellationRate)} icon="percent" bgClass="bg-surface-sunken" colorClass="text-text-soft" />
              <StatCard title="Return Rate" value={formatPct(refundsData.returnRate)} icon="percent" bgClass="bg-surface-sunken" colorClass="text-text-soft" />
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          REVIEWS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : !reviewsData ? <EmptyState onRetry={fetchTab} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Panel */}
              <div className="bg-surface border border-border rounded-xl p-6 shadow-soft">
                <h3 className="font-display font-bold text-[18px] text-text mb-1">Review Summary</h3>
                <p className="text-[13px] text-text-muted mb-6">{formatNumber(reviewsData.totalReviews)} total reviews</p>
                <div className="flex items-center gap-5 mb-6">
                  <div className="text-center">
                    <p className="text-[42px] font-display font-bold text-text leading-none">{reviewsData.averageRating?.toFixed(1)}</p>
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="material-symbols-outlined text-[16px] text-[#FFB400]"
                          style={{ fontVariationSettings: `'FILL' ${reviewsData.averageRating >= s ? 1 : 0}` }}>star</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">avg. rating</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5,4,3,2,1].map(s => (
                      <RatingBar key={s} stars={s} count={reviewsData.distribution?.[s.toString()] || 0} total={reviewsData.totalReviews} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Breakdown Donut */}
              <div className="bg-surface border border-border rounded-xl p-6 shadow-soft flex flex-col items-center justify-center">
                <h3 className="font-display font-bold text-[18px] text-text mb-4 w-full">Rating Distribution</h3>
                {reviewsData.totalReviews === 0 ? (
                  <EmptyState message="No reviews yet." />
                ) : (
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={[5,4,3,2,1].map(s => ({ name: `${s}★`, value: reviewsData.distribution?.[s.toString()] || 0 }))}
                          cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3}>
                          {['#FFB400','#E8A33D','#1E2A47','#948F82','#C1543C'].map((c, i) => (
                            <Cell key={i} fill={c} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={ChartTooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
