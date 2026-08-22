import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminDashboardService } from '../../services/adminDashboardService';
import { sellerApplicationService } from '../../services/sellerApplicationService';

// --- Toast Component ---
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

// --- Skeleton components ---
const SkeletonCard = () => (
  <div className="bg-surface border border-border rounded-xl p-4 flex flex-col animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="w-8 h-8 rounded-lg bg-border/60" />
      <div className="w-12 h-5 rounded-[5px] bg-border/60" />
    </div>
    <div className="w-24 h-7 bg-border/60 rounded mb-1.5" />
    <div className="w-20 h-3 bg-border/60 rounded" />
  </div>
);

const SkeletonChart = () => (
  <div className="flex items-end gap-2.5 h-[150px] pt-2.5 px-2 animate-pulse">
    {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
        <div className="w-full rounded-t-[5px] bg-border/60" style={{ height: `${h}%` }}></div>
        <div className="w-6 h-3 bg-border/60 rounded mt-1"></div>
      </div>
    ))}
  </div>
);

const SkeletonTable = () => (
  <div className="space-y-3 p-2 animate-pulse">
    {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-full bg-border/60 rounded" />)}
  </div>
);

// --- Helpers ---
const formatDateObj = (dateObj = new Date()) => {
  return dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).toUpperCase();
};

// --- Modals ---
function ApproveModal({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-soft-lg w-full max-w-sm p-6 z-10 border border-border">
        <h3 className="font-display font-bold text-[17px] text-text mb-2">Approve Application</h3>
        <p className="text-text-muted text-[13px] mb-5">Are you sure you want to approve this seller application?</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onClose} className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-surface-sunken transition-colors">Cancel</button>
          <button onClick={onConfirm} className="bg-accent text-white font-bold text-[13px] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Approve</button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ onConfirm, onClose }) {
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-soft-lg w-full max-w-md p-6 z-10 border border-border">
        <h3 className="font-display font-bold text-[17px] text-text mb-2">Reject Application</h3>
        <label className="block text-sm font-semibold text-text mb-1.5">
          Rejection Reason <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Incomplete information..."
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-none text-text mb-4"
        />
        <div className="flex gap-2.5 justify-end">
          <button onClick={onClose} className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-surface-sunken transition-colors">Cancel</button>
          <button onClick={() => onConfirm(note)} className="bg-danger text-white font-bold text-[13px] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Reject</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  
  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminDashboardService.getDashboardData();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard data.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong while loading platform data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Application Approval/Rejection
  const handleApproveClick = (id, e) => {
    if (e) e.preventDefault();
    setApproveTarget(id);
  };

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    try {
      await sellerApplicationService.approveApplication(approveTarget);
      addToast('success', 'Seller application approved.');
      fetchDashboardData(); // Refresh to update counts, tables, and top sellers
    } catch (err) {
      addToast('error', err?.response?.data?.message || 'Failed to approve application.');
    } finally {
      setApproveTarget(null);
    }
  };

  const handleRejectClick = (id, e) => {
    if (e) e.preventDefault();
    setRejectTarget(id);
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    try {
      await sellerApplicationService.rejectApplication(rejectTarget, reason);
      addToast('success', 'Seller application rejected.');
      fetchDashboardData();
    } catch (err) {
      addToast('error', err?.response?.data?.message || 'Failed to reject application.');
    } finally {
      setRejectTarget(null);
    }
  };

  // Error State
  if (error && !data) {
    return (
      <div className="pb-10 flex flex-col items-center justify-center pt-20">
        <div className="w-16 h-16 rounded-full bg-danger-bg flex items-center justify-center mb-4 text-danger-content">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h2 className="text-xl font-display font-bold text-text mb-2">Unable to load dashboard data</h2>
        <p className="text-text-muted mb-6">{error}</p>
        <button onClick={fetchDashboardData} className="px-6 py-2.5 bg-text text-white font-bold rounded-lg">Retry</button>
      </div>
    );
  }

  const currentDate = formatDateObj();

  // Overview subtext
  let overviewText = "";
  if (data) {
    const pCount = data.pendingApplicationsCount || 0;
    const dCount = data.openDisputes?.value || 0;
    
    if (pCount === 0 && dCount === 0) {
      overviewText = "No seller approvals or disputes require attention.";
    } else {
      const parts = [];
      if (pCount > 0) parts.push(`${pCount} sellers awaiting approval`);
      if (dCount > 0) parts.push(`${dCount} disputes need a decision`);
      overviewText = parts.join(", ") + ".";
    }
  }

  return (
    <div className="pb-10 min-h-screen">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase text-text-muted font-semibold">{currentDate}</p>
          <h1 className="font-display text-[26px] font-semibold my-1 text-text">Platform overview</h1>
          <p className="m-0 text-text-muted text-[13.5px]">
            {loading && !data ? "Loading overview..." : overviewText}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link to="/admin/reports" className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2.5 rounded-lg hover:bg-surface-sunken transition-colors inline-block">
            Export report
          </Link>
          <Link to="/admin/products" className="bg-text text-white border-none font-bold text-[13px] px-4 py-2.5 rounded-lg hover:bg-text-soft transition-colors inline-block">
            Review approvals
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        {/* GMV */}
        {loading && !data ? <SkeletonCard /> : (
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FBEFDA]">
                <svg stroke="#B9791C" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] ${data.gmv.pctChange >= 0 ? 'bg-[#E6F2E9] text-[#1E7A3E]' : 'bg-danger-bg text-danger-content'}`}>
                {data.gmv.pctChange >= 0 ? '+' : ''}{data.gmv.pctChange}%
              </span>
            </div>
            <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text truncate" title={`₹${data.gmv.value}`}>
              {data.gmv.label}
            </div>
            <div className="text-xs text-text-muted">GMV this month</div>
          </div>
        )}
        
        {/* Orders */}
        {loading && !data ? <SkeletonCard /> : (
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E1EFEE]">
                <svg stroke="#095857" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/></svg>
              </div>
              <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] ${data.orders.pctChange >= 0 ? 'bg-[#E6F2E9] text-[#1E7A3E]' : 'bg-danger-bg text-danger-content'}`}>
                {data.orders.pctChange >= 0 ? '+' : ''}{data.orders.pctChange}%
              </span>
            </div>
            <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text">
              {new Intl.NumberFormat('en-IN').format(data.orders.value)}
            </div>
            <div className="text-xs text-text-muted">Orders this month</div>
          </div>
        )}

        {/* Active Sellers */}
        {loading && !data ? <SkeletonCard /> : (
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E6F2E9]">
                <svg stroke="#1E7A3E" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/></svg>
              </div>
              <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] ${data.activeSellers.newThisMonth >= 0 ? 'bg-[#E6F2E9] text-[#1E7A3E]' : 'bg-danger-bg text-danger-content'}`}>
                {data.activeSellers.newThisMonth >= 0 ? '+' : ''}{data.activeSellers.newThisMonth}
              </span>
            </div>
            <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text">
              {new Intl.NumberFormat('en-IN').format(data.activeSellers.value)}
            </div>
            <div className="text-xs text-text-muted">Active sellers</div>
          </div>
        )}

        {/* Open disputes */}
        {loading && !data ? <SkeletonCard /> : (
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.openDisputes.value > 0 ? 'bg-danger-bg' : 'bg-surface-sunken'}`}>
                <svg stroke={data.openDisputes.value > 0 ? "#7A2A11" : "#948F82"} viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
              </div>
              {data.openDisputes.value > 0 && (
                <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-danger-bg text-danger-content">
                  {data.openDisputes.value} open
                </span>
              )}
            </div>
            <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text">{data.openDisputes.value}</div>
            <div className="text-xs text-text-muted">Open disputes</div>
          </div>
        )}

        {/* Pending payouts */}
        {loading && !data ? <SkeletonCard /> : (
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FDF0DA]">
                <svg stroke="#B9791C" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
              </div>
              <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-[#FDF0DA] text-[#B9791C]">Pending</span>
            </div>
            <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text truncate" title={`₹${data.pendingPayouts.value}`}>
              {data.pendingPayouts.label}
            </div>
            <div className="text-xs text-text-muted">Pending payouts</div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-start">
        
        {/* ── Left Column ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          
          {/* GMV Chart */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Platform GMV, last 7 days</h3>
              <Link to="/admin/reports" className="text-[12.5px] font-bold text-accent-hover hover:underline">Full report →</Link>
            </div>
            {loading && !data ? <SkeletonChart /> : data.gmvChart.data.length === 0 ? (
               <div className="h-[150px] flex items-center justify-center text-[13px] text-text-muted">No sales data available for this period.</div>
            ) : (
              <div className="flex items-end gap-2.5 h-[150px] pt-2.5">
                {data.gmvChart.data.map((dayData, i) => {
                  const isToday = i === data.gmvChart.data.length - 1;
                  const heightPct = data.gmvChart.maxGmv > 0 ? Math.max((dayData.gmv / data.gmvChart.maxGmv) * 100, 2) : 2;
                  return (
                    <div key={dayData.date} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      <div className="absolute -top-8 bg-ink text-white text-[11px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {dayData.label}
                      </div>
                      <div 
                        className={`w-full rounded-t-[5px] transition-all hover:opacity-80 ${isToday ? 'bg-accent' : 'bg-[#DCEAE9]'}`} 
                        style={{height: `${heightPct}%`}}
                      />
                      <span className="text-[11px] text-text-muted font-semibold">{dayData.day}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seller approvals */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Seller approvals</h3>
              <Link to="/admin/seller-applications" className="text-[12.5px] font-bold text-accent-hover hover:underline">View all →</Link>
            </div>
            <div className="overflow-x-auto">
              {loading && !data ? <SkeletonTable /> : data.pendingApplications.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-text-muted">All seller applications have been reviewed.</div>
              ) : (
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Stall</th>
                      <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Location</th>
                      <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Submitted</th>
                      <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Status</th>
                      <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingApplications.map((row) => (
                      <tr key={row._id} className="border-b border-border last:border-0 hover:bg-surface-sunken/50 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[30px] h-[30px] rounded-lg bg-[#FBEFDA] text-[#B9791C] font-bold text-[11.5px] flex items-center justify-center shrink-0">
                              {row.inits}
                            </div>
                            <div>
                              <b className="block text-[12.5px] font-semibold text-text">{row.shopName}</b>
                              <span className="text-[11.5px] text-text-muted">{row.userName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-text">{row.city}</td>
                        <td className="py-3 px-2 text-text">
                           {new Date(row.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FDF0DA] text-[#B9791C] capitalize">{row.status}</span>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <button onClick={(e) => handleApproveClick(row._id, e)} className="border border-[#BFE0DE] text-accent-hover bg-white rounded-md px-2.5 py-1 text-[11.5px] font-semibold hover:bg-accent/10 transition-colors">Approve</button>
                            <button onClick={(e) => handleRejectClick(row._id, e)} className="border border-[#F3C7B8] text-danger-content bg-white rounded-md px-2.5 py-1 text-[11.5px] font-semibold hover:bg-danger/10 transition-colors">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* ── Right Column ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          
          {/* GMV by Category */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
               <h3 className="font-display text-[17px] font-semibold m-0 text-text">GMV by category</h3>
               <Link to="/admin/reports" className="text-[12.5px] font-bold text-accent-hover hover:underline">Full report →</Link>
            </div>
            
            {loading && !data ? <SkeletonTable /> : data.categoryGmv.length === 0 ? (
               <div className="py-4 text-[13px] text-text-muted text-center">No category sales data.</div>
            ) : (
              data.categoryGmv.map(cat => (
                <div key={cat.name} className="flex items-center gap-2.5 py-2 text-[12.5px] group">
                  <span className="w-[92px] shrink-0 font-semibold text-text truncate" title={cat.name}>{cat.name}</span>
                  <div className="flex-1 h-[7px] rounded bg-background overflow-hidden relative">
                    <div className="h-full rounded bg-accent transition-all duration-1000 ease-out" style={{width: cat.w}}></div>
                  </div>
                  <span className="w-[36px] text-right text-text-muted font-semibold">{cat.pct}%</span>
                </div>
              ))
            )}
          </div>

          {/* Top Sellers */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Top sellers</h3>
              <Link to="/admin/sellers" className="text-[12.5px] font-bold text-accent-hover hover:underline">View all →</Link>
            </div>
            {loading && !data ? <SkeletonTable /> : data.topSellers.length === 0 ? (
               <div className="py-4 text-[13px] text-text-muted text-center">Seller performance data will appear here once sales are recorded.</div>
            ) : (
              data.topSellers.map(seller => (
                <div key={seller._id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 hover:bg-surface-sunken/30 transition-colors rounded -mx-2 px-2">
                  <div className="w-[30px] h-[30px] rounded-lg bg-[#FBEFDA] text-[#B9791C] font-bold text-[11.5px] flex items-center justify-center shrink-0">
                    {seller.inits}
                  </div>
                  <div className="flex-1 min-w-0 flex justify-between items-center">
                    <div>
                      <b className="block text-[12.5px] font-semibold text-text truncate" title={seller.name}>{seller.name}</b>
                      <span className="text-[11.5px] text-text-muted">{seller.gmvLabel} GMV</span>
                    </div>
                    {seller.rating && (
                      <div className="flex items-center gap-0.5 text-[#B9791C]">
                         <span className="text-[11.5px] font-bold">{seller.rating}</span>
                         <span className="material-symbols-outlined text-[12px] filled" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Needs Attention */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-[17px] font-semibold m-0 mb-3.5 text-text">Needs attention</h3>
            {loading && !data ? <SkeletonTable /> : data.needsAttention.length === 0 ? (
               <div className="py-4 text-[13px] text-text-muted flex items-center gap-2">
                 <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                 All caught up!
               </div>
            ) : (
              data.needsAttention.map((task, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0 text-[12.5px] text-text">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${task.level === 'danger' ? 'bg-danger' : 'bg-warning'}`}></span>
                  {task.text}
                </div>
              ))
            )}
          </div>
          
        </div>
      </div>

      {approveTarget && (
        <ApproveModal
          onClose={() => setApproveTarget(null)}
          onConfirm={handleApproveConfirm}
        />
      )}
      
      {rejectTarget && (
        <RejectModal
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </div>
  );
}
