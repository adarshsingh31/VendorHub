import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAnalyticsOverview,
  getSalesChart,
  getOrderAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getInventoryAnalytics,
  getRecentActivity,
  getCategorySales,
} from "../../services/analyticsService";
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, Package, DollarSign,
  BarChart2, AlertTriangle, AlertCircle, Loader2, ArrowUpRight, ArrowDownRight,
  Minus, Star, Clock, RefreshCw
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) => `₹${(v || 0).toLocaleString()}`;
const fmtPct = (v) => {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (!isFinite(n)) return "—";
  return `${n > 0 ? "+" : ""}${n}%`;
};

function timeAgo(ts) {
  const secs = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

// ─── Period Selector ─────────────────────────────────────────────────────────
const PERIODS = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
];

function PeriodSelector({ value, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            value === p.value ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function BarChart({ data, metricKey, color = "bg-primary" }) {
  if (!data || data.length === 0) return (
    <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No data for this period.</div>
  );
  const max = Math.max(...data.map((d) => d[metricKey] || 0), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((point, i) => {
        const h = Math.max(4, ((point[metricKey] || 0) / max) * 120);
        const label = metricKey === "orders" ? point[metricKey] : fmt(point[metricKey]);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative min-w-0">
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-1.5 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {label}<br /><span className="text-gray-400 text-[9px]">{point.date}</span>
            </div>
            <div className={`w-full rounded-t-sm ${color}/70 group-hover:${color} transition-all`} style={{ height: `${h}px` }} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, change, loading }) {
  if (loading) return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );

  const changeNum = Number(change);
  const isPositive = changeNum > 0;
  const isNeutral = changeNum === 0 || !isFinite(changeNum);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-sm font-semibold text-gray-700 mt-0.5">{label}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${isNeutral ? "text-gray-400" : isPositive ? "text-green-600" : "text-red-500"}`}>
          {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isNeutral ? "No change" : `${fmtPct(change)} vs prev period`}
        </div>
      )}
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Order Status Bar ─────────────────────────────────────────────────────────
function OrderStatusBar({ data, loading }) {
  if (loading) return <Skeleton className="h-24 w-full" />;
  if (!data) return null;
  const statuses = [
    { key: "pending", label: "Pending", color: "bg-yellow-400" },
    { key: "confirmed", label: "Confirmed", color: "bg-blue-400" },
    { key: "processing", label: "Processing", color: "bg-indigo-400" },
    { key: "shipped", label: "Shipped", color: "bg-purple-400" },
    { key: "delivered", label: "Delivered", color: "bg-green-500" },
    { key: "cancelled", label: "Cancelled", color: "bg-red-400" },
  ];
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {statuses.map((s) => {
        const count = data[s.key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className="w-20 text-xs font-semibold text-gray-600 text-right shrink-0">{s.label}</div>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <div className="w-12 text-xs font-bold text-gray-900 text-right shrink-0">{count}</div>
            <div className="w-10 text-xs text-gray-400 shrink-0">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Category Chart (horizontal bars) ────────────────────────────────────────
function CategoryChart({ data, loading }) {
  if (loading) return <Skeleton className="h-32 w-full" />;
  if (!data || data.length === 0) return <div className="text-sm text-gray-400 py-4 text-center">No category data.</div>;
  const max = Math.max(...data.map((d) => d.grossSales), 1);
  const colors = ["bg-primary", "bg-indigo-400", "bg-purple-400", "bg-pink-400", "bg-orange-400", "bg-yellow-400"];
  return (
    <div className="space-y-3">
      {data.map((cat, i) => {
        const pct = (cat.grossSales / max) * 100;
        return (
          <div key={cat.category} className="flex items-center gap-3">
            <div className="w-28 text-xs font-semibold text-gray-700 truncate text-right shrink-0">{cat.category}</div>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <div className="w-24 text-xs font-bold text-gray-900 text-right shrink-0">{fmt(cat.grossSales)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function SellerAnalytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30d");
  const [chartMetric, setChartMetric] = useState("grossSales");

  // Data states
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);

  const [globalError, setGlobalError] = useState("");

  const [productSort, setProductSort] = useState("grossSales");

  const fetchAll = useCallback(async () => {
    setGlobalError("");
    setLoadingOverview(true); setLoadingChart(true); setLoadingOrders(true);
    setLoadingProducts(true); setLoadingCustomers(true); setLoadingCategory(true);

    try {
      const [ov, ch, ord, prod, cust, cat] = await Promise.all([
        getAnalyticsOverview(period),
        getSalesChart(period),
        getOrderAnalytics(period),
        getProductAnalytics(period),
        getCustomerAnalytics(period),
        getCategorySales(period),
      ]);
      setOverview(ov.overview);
      setChartData(ch.chartData || []);
      setOrderData(ord);
      setProductData(prod.products || []);
      setCustomerData(cust);
      setCategoryData(cat.categorySales || []);
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Failed to load analytics data");
    } finally {
      setLoadingOverview(false); setLoadingChart(false); setLoadingOrders(false);
      setLoadingProducts(false); setLoadingCustomers(false); setLoadingCategory(false);
    }
  }, [period]);

  // Inventory & activity don't depend on period — fetch once
  const fetchStatic = useCallback(async () => {
    setLoadingInventory(true); setLoadingActivity(true);
    try {
      const [inv, act] = await Promise.all([getInventoryAnalytics(), getRecentActivity()]);
      setInventoryData(inv.inventory);
      setActivity(act.activity || []);
    } catch (_) {}
    finally { setLoadingInventory(false); setLoadingActivity(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchStatic(); }, [fetchStatic]);

  const sortedProducts = [...productData].sort((a, b) => b[productSort] - a[productSort]);

  if (globalError) return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="bg-red-50 text-red-600 p-10 rounded-2xl flex flex-col items-center text-center">
        <AlertCircle className="w-12 h-12 mb-3" />
        <h2 className="text-xl font-bold mb-2">Unable to Load Analytics</h2>
        <p className="text-red-500 mb-6 max-w-md">{globalError}</p>
        <button onClick={fetchAll} className="px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1 text-sm">Real-time insights into your store's performance.</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard loading={loadingOverview} label="Gross Sales" value={fmt(overview?.grossSales)} icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600" change={overview?.comparison?.grossSales} />
        <StatCard loading={loadingOverview} label="Net Earnings" value={fmt(overview?.netEarnings)} icon={DollarSign} iconBg="bg-green-50" iconColor="text-green-600" change={overview?.comparison?.grossSales} />
        <StatCard loading={loadingOverview} label="Total Orders" value={overview?.totalOrders ?? "—"} icon={ShoppingBag} iconBg="bg-indigo-50" iconColor="text-indigo-600" change={overview?.comparison?.totalOrders} />
        <StatCard loading={loadingOverview} label="Buyers" value={overview?.totalBuyers ?? "—"} icon={Users} iconBg="bg-purple-50" iconColor="text-purple-600" change={overview?.comparison?.totalBuyers} />
        <StatCard loading={loadingOverview} label="Units Sold" value={overview?.unitsSold ?? "—"} icon={Package} iconBg="bg-orange-50" iconColor="text-orange-600" change={overview?.comparison?.unitsSold} />
        <StatCard loading={loadingOverview} label="Avg. Order Value" value={fmt(overview?.avgOrderValue)} icon={BarChart2} iconBg="bg-pink-50" iconColor="text-pink-600" />
      </div>

      {/* Inventory Alerts */}
      {inventoryData && (inventoryData.lowStock > 0 || inventoryData.outOfStock > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inventoryData.lowStock > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-yellow-800 text-sm">{inventoryData.lowStock} Products Low on Stock</h4>
                <div className="mt-2 space-y-1">
                  {inventoryData.lowStockItems.map((p) => (
                    <div key={p.productId} className="flex justify-between text-xs text-yellow-700">
                      <span className="truncate">{p.name}</span>
                      <span className="font-bold ml-2 shrink-0">{p.stock} left</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate("/seller/inventory")} className="text-xs font-bold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1.5 rounded-lg shrink-0 transition-colors">Manage</button>
            </div>
          )}
          {inventoryData.outOfStock > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-red-800 text-sm">{inventoryData.outOfStock} Products Out of Stock</h4>
                <div className="mt-2 space-y-1">
                  {inventoryData.outOfStockItems.map((p) => (
                    <div key={p.productId} className="text-xs text-red-700 truncate">{p.name}</div>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate("/seller/inventory")} className="text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg shrink-0 transition-colors">Restock</button>
            </div>
          )}
        </div>
      )}

      {/* Sales Chart */}
      <Section title="Sales & Revenue" icon={BarChart2} action={
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
          {[{ key: "grossSales", label: "Sales" }, { key: "netEarnings", label: "Earnings" }, { key: "orders", label: "Orders" }].map((m) => (
            <button key={m.key} onClick={() => setChartMetric(m.key)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartMetric === m.key ? "bg-white shadow text-primary" : "text-gray-500"}`}>{m.label}</button>
          ))}
        </div>
      }>
        {loadingChart ? (
          <div className="h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : (
          <>
            <BarChart data={chartData} metricKey={chartMetric} />
            {chartData.length > 0 && (
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-400">{chartData[0]?.date}</span>
                <span className="text-[10px] text-gray-400">{chartData[chartData.length - 1]?.date}</span>
              </div>
            )}
          </>
        )}
      </Section>

      {/* Two-col row: Order Status + Customer Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Order Status" icon={ShoppingBag}>
          {loadingOrders ? <Skeleton className="h-40 w-full" /> : (
            <>
              <div className="text-2xl font-black text-gray-900 mb-4">{orderData?.total ?? 0} <span className="text-sm font-semibold text-gray-500">total items</span></div>
              <OrderStatusBar data={orderData?.orderStatus} loading={loadingOrders} />
            </>
          )}
        </Section>

        <Section title="Customer Analytics" icon={Users}>
          {loadingCustomers ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { label: "Total Buyers", value: customerData?.customerSummary?.totalBuyers ?? 0, color: "text-blue-600" },
                  { label: "New Buyers", value: customerData?.customerSummary?.newBuyers ?? 0, color: "text-green-600" },
                  { label: "Returning", value: customerData?.customerSummary?.returningBuyers ?? 0, color: "text-purple-600" },
                  { label: "Repeat Rate", value: `${customerData?.customerSummary?.repeatRate ?? 0}%`, color: "text-orange-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-xs font-semibold text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              {customerData?.topCustomers?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Top Customers</h4>
                  <div className="space-y-2">
                    {customerData.topCustomers.slice(0, 5).map((c) => (
                      <div key={c.buyerId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <div className="font-semibold text-sm text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-gray-900">{fmt(c.totalSpent)}</div>
                          <div className="text-xs text-gray-400">{c.orders} order{c.orders !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Section>
      </div>

      {/* Product Performance */}
      <Section title="Product Performance" icon={Star} action={
        <select className="text-xs border border-gray-200 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-primary/20" value={productSort} onChange={(e) => setProductSort(e.target.value)}>
          <option value="grossSales">Revenue</option>
          <option value="unitsSold">Units Sold</option>
          <option value="orders">Orders</option>
          <option value="buyers">Buyers</option>
        </select>
      }>
        {loadingProducts ? (
          <div className="flex flex-col gap-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : productData.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No sales data for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-right">Orders</th>
                  <th className="pb-3 text-right">Units</th>
                  <th className="pb-3 text-right">Buyers</th>
                  <th className="pb-3 text-right">Gross Sales</th>
                  <th className="pb-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedProducts.slice(0, 8).map((p, i) => (
                  <tr key={p.productId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                        {p.productImage && <img src={p.productImage} alt={p.productName} className="w-8 h-8 rounded-lg object-cover border border-gray-100" />}
                        <span className="font-semibold text-sm text-gray-900 line-clamp-1 max-w-[180px]">{p.productName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm text-gray-700">{p.orders}</td>
                    <td className="py-3 text-right text-sm text-gray-700">{p.unitsSold}</td>
                    <td className="py-3 text-right text-sm text-gray-700">{p.buyers}</td>
                    <td className="py-3 text-right font-semibold text-sm text-gray-900">{fmt(p.grossSales)}</td>
                    <td className="py-3 text-right font-black text-sm text-green-700">{fmt(p.netEarnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Two-col: Category Sales + Inventory Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Sales by Category" icon={BarChart2}>
          <CategoryChart data={categoryData} loading={loadingCategory} />
        </Section>

        <Section title="Inventory Overview" icon={Package} action={
          <button onClick={() => navigate("/seller/inventory")} className="text-xs font-bold text-primary hover:underline">Manage →</button>
        }>
          {loadingInventory ? <Skeleton className="h-40 w-full" /> : inventoryData ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Total Products", value: inventoryData.totalProducts, color: "text-blue-600" },
                  { label: "Total Units", value: inventoryData.totalUnits, color: "text-indigo-600" },
                  { label: "In Stock", value: inventoryData.inStock, color: "text-green-600" },
                  { label: "Out of Stock", value: inventoryData.outOfStock, color: "text-red-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Inventory Value</span>
                  <span className="font-black text-gray-900">{fmt(inventoryData.inventoryValue)}</span>
                </div>
              </div>
            </>
          ) : <div className="text-sm text-gray-400 py-4 text-center">No inventory data.</div>}
        </Section>
      </div>

      {/* Earnings Summary */}
      <Section title="Earnings Summary" icon={DollarSign}>
        {loadingOverview ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Gross Sales", value: fmt(overview?.grossSales), color: "text-blue-700", bg: "bg-blue-50" },
              { label: "Platform Fees", value: fmt(overview?.platformFees), color: "text-red-600", bg: "bg-red-50" },
              { label: "Net Earnings", value: fmt(overview?.netEarnings), color: "text-green-700", bg: "bg-green-50" },
              { label: "Avg. Order", value: fmt(overview?.avgOrderValue), color: "text-indigo-700", bg: "bg-indigo-50" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs font-semibold text-gray-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Note: Net Earnings = Gross Sales − Platform Fees. View full breakdown in the{" "}
          <button onClick={() => navigate("/seller/earnings")} className="text-primary font-semibold hover:underline">Earnings</button>{" "}
          section.
        </p>
      </Section>

      {/* Recent Activity */}
      <Section title="Recent Activity" icon={Clock}>
        {loadingActivity ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : activity.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No recent activity. Activity will appear here when customers purchase your products.</div>
        ) : (
          <div className="space-y-1">
            {activity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.subText}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{timeAgo(item.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Empty state banner (when no data at all) */}
      {!loadingOverview && !overview?.totalOrders && (
        <div className="bg-gradient-to-r from-primary/5 to-indigo-50 border border-primary/10 rounded-xl p-8 text-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No sales data yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">Analytics will populate automatically once customers start purchasing your products.</p>
          <button onClick={() => navigate("/seller/products")} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors">View Your Products</button>
        </div>
      )}
    </div>
  );
}
