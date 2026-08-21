import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../../services/analyticsService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n) {
  if (n == null) return "₹0";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatGrowth(growth) {
  if (growth === null || growth === undefined) return { label: "New", positive: true };
  const rounded = Math.abs(Math.round(growth));
  return {
    label: `${growth >= 0 ? "+" : "−"}${rounded}%`,
    positive: growth >= 0,
  };
}

function getDayLabel(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getDynamicDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).toUpperCase();
}

function getDynamicMessage(awaitingShipment, lowStockCount) {
  const parts = [];
  if (awaitingShipment > 0)
    parts.push(`${awaitingShipment} order${awaitingShipment > 1 ? "s" : ""} need${awaitingShipment === 1 ? "s" : ""} packing today`);
  if (lowStockCount > 0)
    parts.push(`${lowStockCount} product${lowStockCount > 1 ? "s are" : " is"} almost out of stock`);
  if (parts.length === 0) return "Your store is all caught up today. 🎉";
  return parts.join(", and ") + ".";
}

function getStatusStyle(status) {
  switch (status) {
    case "pending":    return "bg-[#FDF0DA] text-[#B9791C]";
    case "confirmed":  return "bg-[#E1EFEE] text-[#095857]";
    case "processing": return "bg-[#FDF0DA] text-[#B9791C]";
    case "shipped":    return "bg-[#E1EFEE] text-[#095857]";
    case "delivered":  return "bg-[#E6F2E9] text-[#1E7A3E]";
    case "cancelled":  return "bg-danger-bg text-danger-content";
    default:           return "bg-[#F0F0F0] text-[#666]";
  }
}

function getStatusLabel(status) {
  const labels = {
    pending: "Pack today",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

function renderStars(n) {
  return "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
}

// ─── Skeleton Components ───────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="w-8 h-8 rounded-lg bg-gray-200" />
        <div className="w-12 h-5 rounded bg-gray-200" />
      </div>
      <div className="h-7 w-24 rounded bg-gray-200 mb-1.5" />
      <div className="h-3.5 w-28 rounded bg-gray-200" />
    </div>
  );
}

function SkeletonBar() {
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5">
      <div className="w-full rounded-t-[5px] bg-gray-200 animate-pulse" style={{ height: `${30 + Math.random() * 60}px` }} />
      <div className="h-3 w-6 rounded bg-gray-200 animate-pulse" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {[80, 140, 100, 60, 70].map((w, i) => (
        <td key={i} className="py-3 px-2">
          <div className="h-3.5 rounded bg-gray-200 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonProduct() {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex-1">
        <div className="h-3.5 w-32 rounded bg-gray-200 mb-1.5" />
        <div className="h-3 w-20 rounded bg-gray-200" />
      </div>
      <div className="h-5 w-12 rounded bg-gray-200" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Error State ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-14 h-14 rounded-full bg-danger-bg flex items-center justify-center text-2xl">⚠</div>
        <h2 className="font-display text-xl font-semibold text-text">Unable to load dashboard data</h2>
        <p className="text-text-muted text-sm">{error}</p>
        <button
          onClick={load}
          className="px-5 py-2.5 bg-primary text-primary-content font-bold text-sm rounded-lg hover-lift"
        >
          Try again
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const salesLast7Days = data?.salesLast7Days || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const recentOrders = data?.recentOrders || [];
  const todo = data?.todo || [];
  const storeName = data?.seller?.storeName || "";
  const storeSlug = data?.seller?.slug || null;
  const outOfStockCount = data?.outOfStockCount || 0;

  // Chart: compute max sales for relative bar heights
  const maxSales = Math.max(...salesLast7Days.map((d) => d.sales), 1);
  const MAX_BAR_PX = 110;

  const revGrowth = formatGrowth(summary.revenueGrowth);
  const ordGrowth = formatGrowth(summary.orderGrowth);

  const awaitingShipment = summary.awaitingShipment ?? 0;
  const dueToday = summary.dueToday ?? 0;

  return (
    <div className="pb-10">
      {/* ── Welcome Header ──────────────────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase text-text-muted font-semibold">
            {getDynamicDate()}
          </p>
          <h1 className="font-display text-[26px] font-semibold my-1 text-text">
            {loading
              ? <span className="inline-block h-7 w-64 rounded bg-gray-200 animate-pulse align-middle" />
              : `Welcome back, ${storeName}`
            }
          </h1>
          <p className="m-0 text-text-muted text-[13.5px]">
            {loading
              ? <span className="inline-block h-4 w-80 rounded bg-gray-200 animate-pulse" />
              : getDynamicMessage(awaitingShipment, lowStockProducts.length)
            }
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2.5 rounded-lg hover-lift"
            onClick={() => storeSlug ? navigate(`/store/${storeSlug}`) : navigate("/buyer/products")}
          >
            View storefront
          </button>
          <button
            type="button"
            onClick={() => navigate("/seller/products/add")}
            className="bg-primary text-primary-content border-none font-bold text-[13px] px-4 py-2.5 rounded-lg hover-lift flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add product
          </button>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            {/* Revenue */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FBEFDA]">
                  <svg stroke="#B9791C" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] ${revGrowth.positive ? "bg-[#E6F2E9] text-[#1E7A3E]" : "bg-danger-bg text-danger-content"}`}>
                  {revGrowth.label}
                </span>
              </div>
              <div className="font-display text-[26px] font-semibold mt-3 mb-0.5 text-text">
                {formatCurrency(summary.monthlyRevenue)}
              </div>
              <div className="text-[12.5px] text-text-muted">Revenue this month</div>
            </div>

            {/* Orders */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E1EFEE]">
                  <svg stroke="#095857" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none">
                    <path d="M3 7l9-4 9 4-9 4-9-4z" />
                    <path d="M3 7v10l9 4 9-4V7" />
                  </svg>
                </div>
                <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] ${ordGrowth.positive ? "bg-[#E6F2E9] text-[#1E7A3E]" : "bg-danger-bg text-danger-content"}`}>
                  {ordGrowth.label}
                </span>
              </div>
              <div className="font-display text-[26px] font-semibold mt-3 mb-0.5 text-text">
                {summary.monthlyOrders ?? 0}
              </div>
              <div className="text-[12.5px] text-text-muted">Orders this month</div>
            </div>

            {/* Awaiting Shipment */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-danger-bg">
                  <svg stroke="#7A2A11" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                </div>
                <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-danger-bg text-danger-content">
                  {dueToday > 0 ? `${dueToday} due` : "All caught up"}
                </span>
              </div>
              <div className="font-display text-[26px] font-semibold mt-3 mb-0.5 text-text">
                {awaitingShipment}
              </div>
              <div className="text-[12.5px] text-text-muted">Awaiting shipment</div>
            </div>

            {/* Reviews */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E6F2E9]">
                  <svg stroke="#1E7A3E" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none">
                    <path d="M12 17.3l-6.2 3.6 1.6-7-5.4-4.7 7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7z" />
                  </svg>
                </div>
                <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-[#E6F2E9] text-[#1E7A3E]">
                  {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "–"}
                </span>
              </div>
              <div className="font-display text-[26px] font-semibold mt-3 mb-0.5 text-text">
                {summary.totalReviews ?? 0}
              </div>
              <div className="text-[12.5px] text-text-muted">Total reviews</div>
            </div>
          </>
        )}
      </div>

      {/* ── Main Content Grid ────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-start">

        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Sales Chart */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Sales, last 7 days</h3>
              <button
                onClick={() => navigate("/seller/analytics")}
                className="text-[12.5px] font-bold text-accent-hover hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Full report →
              </button>
            </div>
            <div className="flex items-end gap-2.5 h-[150px] pt-2.5">
              {loading
                ? Array.from({ length: 7 }).map((_, i) => <SkeletonBar key={i} />)
                : salesLast7Days.length === 0
                ? <div className="w-full flex items-center justify-center text-text-muted text-sm">No sales data available</div>
                : salesLast7Days.map((day, i) => {
                    const barH = day.sales === 0 ? 4 : Math.max(8, Math.round((day.sales / maxSales) * MAX_BAR_PX));
                    const isToday = i === salesLast7Days.length - 1;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5" title={`₹${day.sales.toLocaleString("en-IN")}`}>
                        <div
                          className={`w-full rounded-t-[5px] transition-all ${isToday ? "bg-primary" : "bg-[#EFE3C9]"}`}
                          style={{ height: `${barH}px` }}
                        />
                        <span className="text-[11px] text-text-muted font-semibold">{getDayLabel(day.date)}</span>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Recent orders</h3>
              <button
                onClick={() => navigate("/seller/orders")}
                className="text-[12.5px] font-bold text-accent-hover hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                View all →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {["Order", "Item", "Buyer", "Amount", "Status"].map(h => (
                      <th key={h} className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    : recentOrders.length === 0
                    ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-text-muted text-sm">No orders yet.</td>
                      </tr>
                    )
                    : recentOrders.map((row) => (
                      <tr
                        key={row._id}
                        className="border-b border-border last:border-0 cursor-pointer hover:bg-background transition-colors"
                        onClick={() => navigate(`/seller/orders/${row._id}`)}
                      >
                        <td className="py-3 pr-2 font-bold text-text">{row.orderId}</td>
                        <td className="py-3 px-2 text-text max-w-[120px] truncate">{row.item}</td>
                        <td className="py-3 px-2 text-text-muted text-xs">{row.buyer}</td>
                        <td className="py-3 px-2 text-text font-medium">{formatCurrency(row.amount)}</td>
                        <td className="py-3 pl-2">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getStatusStyle(row.status)}`}>
                            {getStatusLabel(row.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right Column ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Low Stock */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Low stock</h3>
              <button
                onClick={() => navigate("/seller/inventory")}
                className="text-[12.5px] font-bold text-accent-hover hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Manage →
              </button>
            </div>

            {/* Out of Stock alert */}
            {!loading && outOfStockCount > 0 && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-danger-bg text-danger-content text-[12px] font-semibold">
                ⚠ {outOfStockCount} product{outOfStockCount > 1 ? "s are" : " is"} out of stock.
              </div>
            )}

            {loading
              ? <><SkeletonProduct /><SkeletonProduct /><SkeletonProduct /></>
              : lowStockProducts.length === 0
              ? <p className="text-text-muted text-sm py-2">No low-stock products. Inventory is healthy.</p>
              : lowStockProducts.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                >
                  <img
                    className="w-10 h-10 rounded-lg object-cover bg-background shrink-0"
                    src={item.image || `https://placehold.co/80x80?text=${encodeURIComponent(item.name[0])}`}
                    alt={item.name}
                    onError={(e) => { e.target.src = `https://placehold.co/80x80?text=${encodeURIComponent(item.name[0])}`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <b className="block text-[12.5px] font-semibold text-text truncate">{item.name}</b>
                    <span className="text-[11.5px] text-text-muted">{item.category || "Uncategorized"}</span>
                  </div>
                  <span className="text-[11px] font-bold text-danger-content bg-danger-bg px-2 py-0.5 rounded-[5px] whitespace-nowrap">
                    {item.stock} left
                  </span>
                </div>
              ))
            }
          </div>

          {/* To Do */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-[17px] font-semibold m-0 mb-3.5 text-text">To do</h3>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                  <div className="h-3.5 w-48 rounded bg-gray-200" />
                </div>
              ))
              : todo.map((task, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 py-2.5 border-b border-border last:border-0 text-[12.5px] text-text ${task.link ? "cursor-pointer hover:text-accent-hover transition-colors" : ""}`}
                  onClick={() => task.link && navigate(task.link)}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${task.link ? "bg-danger" : "bg-[#1E7A3E]"}`} />
                  {task.text}
                  {task.action && (
                    <span className="ml-auto text-[11px] text-accent-hover font-semibold">{task.action} →</span>
                  )}
                </div>
              ))
            }
          </div>

          {/* Latest Reviews */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Latest reviews</h3>
              <button
                onClick={() => navigate("/seller/reviews")}
                className="text-[12.5px] font-bold text-accent-hover hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                View all →
              </button>
            </div>
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="py-3 border-b border-border last:border-0 animate-pulse">
                  <div className="h-3 w-16 rounded bg-gray-200 mb-2" />
                  <div className="h-3.5 w-full rounded bg-gray-200 mb-1.5" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>
              ))
              : !data?.latestReviews || data.latestReviews.length === 0
              ? <p className="text-text-muted text-sm py-2">No reviews yet.</p>
              : data.latestReviews.map((rev, i) => (
                <div key={i} className="py-3 border-b border-border last:border-0 last:pb-0">
                  <div className="text-[#B9791C] text-xs font-bold mb-1">{renderStars(rev.rating)}</div>
                  <p className="m-0 mb-1 text-[12.5px] text-text-soft line-clamp-2">{rev.comment}</p>
                  <span className="text-[11px] text-text-muted">
                    {rev.buyer?.name || "Anonymous"} · {new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
