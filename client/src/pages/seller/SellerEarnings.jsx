import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEarningsSummary,
  getEarningsTransactions,
  getProductPerformance,
  getEarningsChart,
} from "../../services/earningsService";
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Package,
  ChevronDown,
  BarChart2,
  X,
} from "lucide-react";

// ─── Tiny Bar Chart ──────────────────────────────────────────────────────────
function MiniChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.grossSales), 1);
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((point, i) => {
        const h = Math.max(4, (point.grossSales / max) * 80);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t-sm bg-primary/70 hover:bg-primary transition-all cursor-pointer"
              style={{ height: `${h}px` }}
            >
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-1.5 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                ₹{point.grossSales.toLocaleString()}<br />
                <span className="text-gray-400 text-[9px]">{point.date}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-20" />
    </div>
  );
}

// ─── Transaction Detail Modal ─────────────────────────────────────────────────
function TransactionModal({ tx, onClose }) {
  if (!tx) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="font-bold text-lg">Transaction Details</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">#{tx.orderId.toString().slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Buyer */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <p className="font-bold text-gray-900">{tx.buyer.name}</p>
              <p className="text-sm text-gray-600">{tx.buyer.email}</p>
              {tx.buyer.phone && <p className="text-sm text-gray-600">{tx.buyer.phone}</p>}
            </div>
          </section>

          {/* Product */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product</h4>
            <div className="bg-gray-50 rounded-xl p-4 flex gap-4 items-center">
              {tx.product.image && (
                <img src={tx.product.image} alt={tx.product.name} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
              )}
              <div>
                <p className="font-bold text-gray-900">{tx.product.name}</p>
                <p className="text-sm text-gray-500 mt-1">Quantity: {tx.quantity}</p>
                <p className="text-sm text-gray-500">Unit Price: ₹{tx.unitPrice.toLocaleString()}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">Total: ₹{tx.grossAmount.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                <span className={`font-bold uppercase ${tx.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>{tx.paymentStatus}</span>
              </div>
              {tx.razorpayPaymentId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-mono text-gray-700 text-xs">{tx.razorpayPaymentId}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Date</span>
                <span className="font-medium text-gray-900">{new Date(tx.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </section>

          {/* Shipping */}
          {tx.shippingAddress && (
            <section>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h4>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-0.5">
                <p className="font-semibold">{tx.shippingAddress.fullName}</p>
                <p>{tx.shippingAddress.addressLine1}</p>
                {tx.shippingAddress.addressLine2 && <p>{tx.shippingAddress.addressLine2}</p>}
                <p>{tx.shippingAddress.city}, {tx.shippingAddress.state} - {tx.shippingAddress.postalCode}</p>
              </div>
            </section>
          )}

          {/* Earnings Breakdown */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Earnings Breakdown</h4>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gross Amount</span>
                <span className="font-semibold text-gray-900">₹{tx.grossAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-semibold text-red-600">- ₹{tx.platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Fee</span>
                <span className="font-semibold text-gray-500">₹0</span>
              </div>
              <div className="flex justify-between text-sm border-t border-green-200 pt-2 mt-1">
                <span className="font-bold text-gray-800">Net Earnings</span>
                <span className="font-black text-green-700">₹{tx.netAmount.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const PERIODS = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
];

export default function SellerEarnings() {
  const navigate = useNavigate();
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [summary, setSummary] = useState(null);

  const [chartPeriod, setChartPeriod] = useState("30d");
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState("");
  const [txTotal, setTxTotal] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [txPages, setTxPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [productPerf, setProductPerf] = useState([]);
  const [productLoading, setProductLoading] = useState(true);

  const [selectedTx, setSelectedTx] = useState(null);

  // Tabs: transactions | products
  const [tab, setTab] = useState("transactions");

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError("");
      const data = await getEarningsSummary();
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err.response?.data?.message || "Failed to load earnings summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchChart = useCallback(async () => {
    try {
      setChartLoading(true);
      const data = await getEarningsChart(chartPeriod);
      setChartData(data.chartData || []);
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [chartPeriod]);

  const fetchTransactions = useCallback(async () => {
    try {
      setTxLoading(true);
      setTxError("");
      const data = await getEarningsTransactions({
        search,
        status: statusFilter,
        period: "all",
        page: txPage,
        limit: 15,
      });
      setTransactions(data.transactions || []);
      setTxTotal(data.total || 0);
      setTxPages(data.pages || 1);
    } catch (err) {
      setTxError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setTxLoading(false);
    }
  }, [search, statusFilter, txPage]);

  const fetchProductPerf = async () => {
    try {
      setProductLoading(true);
      const data = await getProductPerformance();
      setProductPerf(data.productPerformance || []);
    } catch {
      setProductPerf([]);
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchProductPerf();
  }, []);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  useEffect(() => {
    const t = setTimeout(fetchTransactions, 400);
    return () => clearTimeout(t);
  }, [fetchTransactions]);

  const getItemStatusColor = (s) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-indigo-100 text-indigo-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return map[s] || "bg-gray-100 text-gray-700";
  };

  const fmt = (v) => `₹${(v || 0).toLocaleString()}`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings</h1>
        <p className="text-gray-500">Track your revenue, fees, and net earnings from real orders.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : summaryError ? (
          <div className="col-span-4 bg-red-50 text-red-600 p-6 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{summaryError}</span>
            <button onClick={fetchSummary} className="ml-auto px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-semibold">Retry</button>
          </div>
        ) : (
          [
            { label: "Gross Sales", value: fmt(summary?.grossSales), sub: "All paid orders", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Net Earnings", value: fmt(summary?.netEarnings), sub: `After ${summary?.platformFeePercent || 0}% platform fee`, icon: DollarSign, color: "text-green-700", bg: "bg-green-50" },
            { label: "Pending Earnings", value: fmt(summary?.pendingEarnings), sub: "Awaiting delivery", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Total Refunds", value: fmt(summary?.refunds), sub: "Cancelled items", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          ].map((card, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl font-black text-gray-900">{card.value}</div>
              <div className="text-sm font-semibold text-gray-700 mt-1">{card.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
            </div>
          ))
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" /> Earnings Over Time
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Gross sales from verified orders</p>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setChartPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${chartPeriod === p.value ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-800"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {chartLoading ? (
          <div className="h-24 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-gray-400 text-sm">No sales data for this period.</div>
        ) : (
          <MiniChart data={chartData} />
        )}
        {chartData.length > 0 && (
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-400">{chartData[0]?.date}</span>
            <span className="text-[10px] text-gray-400">{chartData[chartData.length - 1]?.date}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${tab === "transactions" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          onClick={() => setTab("transactions")}
        >
          Earning Transactions
        </button>
        <button
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${tab === "products" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          onClick={() => setTab("products")}
        >
          Product Performance
        </button>
      </div>

      {/* ── Transactions Tab ── */}
      {tab === "transactions" && (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, buyer, or product..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setTxPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                className="border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setTxPage(1); }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {txLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-gray-500 text-sm">Loading transactions...</p>
            </div>
          ) : txError ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center text-center">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="font-bold">{txError}</p>
              <button onClick={fetchTransactions} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-semibold">Try Again</button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No earnings yet</h3>
              <p className="text-gray-500 max-w-sm mb-6">Your earnings will appear here when customers purchase your products.</p>
              <button onClick={() => navigate("/seller/products")} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                View Products
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">{txTotal} transaction{txTotal !== 1 ? "s" : ""}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[860px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="p-4">Date</th>
                      <th className="p-4">Order</th>
                      <th className="p-4">Buyer</th>
                      <th className="p-4">Product</th>
                      <th className="p-4 text-right">Qty</th>
                      <th className="p-4 text-right">Gross</th>
                      <th className="p-4 text-right">Fee</th>
                      <th className="p-4 text-right">Net</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr
                        key={tx._id}
                        className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                        onClick={() => setSelectedTx(tx)}
                      >
                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(tx.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs text-gray-600">#{tx.orderId.toString().slice(-8).toUpperCase()}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-900 text-sm">{tx.buyer.name}</div>
                          <div className="text-xs text-gray-400">{tx.buyer.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {tx.product.image && (
                              <img src={tx.product.image} alt={tx.product.name} className="w-8 h-8 rounded-lg object-cover border border-gray-100" />
                            )}
                            <span className="text-sm font-medium text-gray-800 line-clamp-1 max-w-[180px]">{tx.product.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right text-sm font-medium text-gray-700">{tx.quantity}</td>
                        <td className="p-4 text-right text-sm font-semibold text-gray-900">{fmt(tx.grossAmount)}</td>
                        <td className="p-4 text-right text-sm text-red-500 font-medium">{tx.platformFee > 0 ? `-${fmt(tx.platformFee)}` : "₹0"}</td>
                        <td className="p-4 text-right text-sm font-black text-green-700">{fmt(tx.netAmount)}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getItemStatusColor(tx.itemStatus)}`}>
                            {tx.itemStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {txPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                  <button
                    disabled={txPage <= 1}
                    onClick={() => setTxPage((p) => p - 1)}
                    className="px-3 py-1.5 text-sm font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">Page {txPage} of {txPages}</span>
                  <button
                    disabled={txPage >= txPages}
                    onClick={() => setTxPage((p) => p + 1)}
                    className="px-3 py-1.5 text-sm font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Product Performance Tab ── */}
      {tab === "products" && (
        <>
          {productLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-gray-500 text-sm">Loading product data...</p>
            </div>
          ) : productPerf.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
              <Package className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No sales yet</h3>
              <p className="text-gray-500 max-w-sm">Product performance will appear here when customers purchase your products.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[740px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="p-4">Product</th>
                      <th className="p-4 text-right">Units Sold</th>
                      <th className="p-4 text-right">Orders</th>
                      <th className="p-4 text-right">Gross Sales</th>
                      <th className="p-4 text-right">Net Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productPerf.map((p) => (
                      <tr key={p.productId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {p.productImage && (
                              <img src={p.productImage} alt={p.productName} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                            )}
                            <span className="font-semibold text-sm text-gray-900 line-clamp-2 max-w-xs">{p.productName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium text-gray-900 text-sm">{p.unitsSold}</td>
                        <td className="p-4 text-right font-medium text-gray-900 text-sm">{p.orders}</td>
                        <td className="p-4 text-right font-semibold text-gray-900 text-sm">{fmt(p.grossSales)}</td>
                        <td className="p-4 text-right font-black text-green-700 text-sm">{fmt(p.netEarnings)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200">
                    <tr className="bg-gray-50">
                      <td className="p-4 font-bold text-gray-900">Total</td>
                      <td className="p-4 text-right font-bold text-gray-900">{productPerf.reduce((a, p) => a + p.unitsSold, 0)}</td>
                      <td className="p-4 text-right font-bold text-gray-900">{productPerf.reduce((a, p) => a + p.orders, 0)}</td>
                      <td className="p-4 text-right font-bold text-gray-900">{fmt(productPerf.reduce((a, p) => a + p.grossSales, 0))}</td>
                      <td className="p-4 text-right font-black text-green-700">{fmt(productPerf.reduce((a, p) => a + p.netEarnings, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payout Section */}
      <div className="mt-8 bg-gradient-to-r from-primary/5 to-indigo-50 rounded-xl border border-primary/10 p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">Payout</h3>
          <p className="text-gray-500 text-sm mt-1">Direct seller payouts will be available soon. Your earnings are tracked and secured.</p>
        </div>
        <div className="text-center sm:text-right">
          <div className="text-2xl font-black text-gray-900">{fmt(summary?.netEarnings)}</div>
          <div className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">Net Earnings</div>
          <button disabled className="mt-3 px-5 py-2 bg-primary/30 text-primary/60 font-semibold rounded-xl text-sm cursor-not-allowed">
            Payouts Coming Soon
          </button>
        </div>
      </div>

      {/* Transaction Modal */}
      {selectedTx && <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}
