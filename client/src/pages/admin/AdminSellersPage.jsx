import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminSellerService } from '../../services/adminSellerService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

// ─── UI Components ────────────────────────────────────────────────────────────

function SellerStatusBadge({ status }) {
  let bgClass, textClass, label;

  switch (status) {
    case 'active':
      bgClass = 'bg-[#E6F2E9]';
      textClass = 'text-[#1E7A3E]';
      label = 'Active';
      break;
    case 'pending':
      bgClass = 'bg-[#FDF0DA]';
      textClass = 'text-[#B9791C]';
      label = 'Pending';
      break;
    case 'suspended':
      bgClass = 'bg-danger-bg';
      textClass = 'text-danger-content';
      label = 'Suspended';
      break;
    case 'rejected':
      bgClass = 'bg-surface-sunken';
      textClass = 'text-text-muted';
      label = 'Rejected';
      break;
    default:
      bgClass = 'bg-surface-sunken';
      textClass = 'text-text-soft';
      label = 'Unknown';
      break;
  }

  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${bgClass} ${textClass} uppercase tracking-wider`}>
      {label}
    </span>
  );
}

function ConfirmModal({ isOpen, title, message, confirmText, isDestructive, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-soft-lg w-full max-w-md p-6 z-10 border border-border">
        <h3 className="font-display font-bold text-[20px] text-text mb-2">{title}</h3>
        <p className="text-text-muted text-[14px] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-[13px] font-semibold text-text-soft bg-surface border border-border rounded-lg hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-[13px] font-bold text-white rounded-lg flex items-center gap-2 ${
              isDestructive ? 'bg-danger hover:bg-danger/90' : 'bg-primary-hover hover:bg-primary-content'
            }`}
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ isOpen, onClose, onConfirm, loading }) {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-soft-lg w-full max-w-md p-6 z-10 border border-border">
        <h3 className="font-display font-bold text-[20px] text-text mb-2">Reject Application</h3>
        <p className="text-text-muted text-[13px] mb-4">Please provide a reason for rejecting this seller application.</p>
        
        <label className="block text-sm font-semibold text-text mb-1.5">
          Rejection Reason <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Incomplete information..."
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none text-text mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-[13px] font-semibold text-text-soft bg-surface border border-border rounded-lg hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={loading}
            className="px-4 py-2 text-[13px] font-bold text-white bg-danger rounded-lg flex items-center gap-2 hover:bg-danger/90"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Reject Application
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-[18px] text-text-muted shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-[13.5px] text-text">{value || '—'}</p>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function SellerDetailPanel({ sellerId, onClose, onStatusChange, onApprove, onRejectClick, loadingAction }) {
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders

  const fetchDetails = useCallback(async () => {
    if (!sellerId) return;
    try {
      setLoading(true);
      const data = await adminSellerService.getSellerById(sellerId);
      setSellerData(data.seller);
    } catch (err) {
      setError('Failed to load seller details.');
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (!sellerId) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-surface border-l border-border w-full max-w-2xl h-full overflow-hidden shadow-soft-lg z-10 flex flex-col">
        
        {/* Header */}
        <div className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="font-display font-bold text-[20px] text-text flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">store</span>
            Seller Details
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-sunken transition-colors">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <span className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <span className="material-symbols-outlined text-danger-content text-5xl mb-4">error</span>
              <p className="text-danger-content font-medium text-lg">{error}</p>
            </div>
          ) : sellerData ? (
            <div className="p-6">
              
              {/* Profile Header */}
              <div className="flex items-start gap-5 mb-8">
                {sellerData.storeProfile?.storeLogo ? (
                  <img src={sellerData.storeProfile.storeLogo} alt="Store Logo" className="w-20 h-20 rounded-xl object-cover border border-border shadow-sm" />
                ) : sellerData.avatar ? (
                  <img src={sellerData.avatar} alt="Avatar" className="w-20 h-20 rounded-xl object-cover border border-border shadow-sm" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-primary/10 text-primary-hover font-bold text-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                    {getInitials(sellerData.storeProfile?.storeName || sellerData.latestApplication?.shopName || sellerData.name)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h2 className="font-display font-bold text-[24px] text-text truncate">
                      {sellerData.storeProfile?.storeName || sellerData.application?.shopName || 'Unknown Store'}
                    </h2>
                    <SellerStatusBadge status={sellerData.unifiedStatus} />
                  </div>
                  <p className="text-[14px] font-medium text-text-soft">Owner: {sellerData.name}</p>
                  <p className="text-[13px] text-text-muted truncate">{sellerData.email}</p>
                </div>
              </div>

              {/* Pending Application Action Banner */}
              {sellerData.unifiedStatus === 'pending' && sellerData.application && (
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="font-bold text-brand-900 text-[15px] mb-1">Pending Seller Application</h4>
                    <p className="text-[13px] text-brand-800">This user has requested to become a seller.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => onRejectClick(sellerData)}
                      disabled={loadingAction}
                      className="px-4 py-2 border border-danger/30 text-danger-content bg-white rounded-lg text-[13px] font-semibold hover:bg-danger-bg transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => onApprove(sellerData.application._id)}
                      disabled={loadingAction}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-bold transition-colors disabled:opacity-50"
                    >
                      {loadingAction ? 'Approving...' : 'Approve Seller'}
                    </button>
                  </div>
                </div>
              )}

              {/* Rejected Application Banner */}
              {sellerData.unifiedStatus === 'rejected' && sellerData.application && (
                <div className="bg-danger-bg border border-danger/20 rounded-xl p-5 mb-8 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-danger-content mt-0.5">block</span>
                    <div>
                      <h4 className="font-bold text-danger-content text-[15px] mb-1">Application Rejected</h4>
                      <p className="text-[13px] text-danger-content/80 mb-2">
                        Rejected on {formatDate(sellerData.application.reviewedAt)}
                      </p>
                      {sellerData.application.adminNote && (
                        <div className="bg-white/50 p-3 rounded-lg border border-danger/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-danger-content/70 block mb-1">Admin Note</span>
                          <p className="text-[13px] text-danger-content">{sellerData.application.adminNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-border mb-6">
                {['overview', 'products', 'orders'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-[14px] font-semibold capitalize border-b-2 transition-colors ${
                      activeTab === tab 
                        ? 'border-primary text-primary-hover' 
                        : 'border-transparent text-text-muted hover:text-text'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-up">
                  
                  {/* Business Statistics Grid */}
                  <div>
                    <h3 className="font-bold text-[16px] text-text mb-4">Business Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-surface-sunken p-4 rounded-xl border border-border">
                        <p className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-2">Gross Sales</p>
                        <p className="text-[22px] font-display font-bold text-text">₹{sellerData.businessStats?.totalRevenue?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-surface-sunken p-4 rounded-xl border border-border">
                        <p className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-2">Earnings</p>
                        <p className="text-[22px] font-display font-bold text-success">₹{sellerData.businessStats?.sellerEarnings?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-surface-sunken p-4 rounded-xl border border-border">
                        <p className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-2">Total Orders</p>
                        <p className="text-[22px] font-display font-bold text-text">{sellerData.businessStats?.totalOrders || 0}</p>
                      </div>
                      <div className="bg-surface-sunken p-4 rounded-xl border border-border">
                        <p className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-2">Products</p>
                        <p className="text-[22px] font-display font-bold text-text">{sellerData.businessStats?.productsListed || 0}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-6 text-[13px] bg-background p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-2 text-text-soft">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1E7A3E]"></span>
                        <b className="text-text">{sellerData.businessStats?.completedOrders || 0}</b> Completed Orders
                      </div>
                      <div className="flex items-center gap-2 text-text-soft">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B9791C]"></span>
                        <b className="text-text">{sellerData.businessStats?.pendingOrders || 0}</b> Pending Orders
                      </div>
                      <div className="flex items-center gap-2 text-text-soft">
                        <span className="w-2.5 h-2.5 rounded-full bg-danger"></span>
                        <b className="text-text">{sellerData.businessStats?.cancelledOrders || 0}</b> Cancelled Orders
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-[16px] text-text mb-2 pb-2 border-b border-border">Seller Information</h3>
                      <DetailRow icon="person" label="Owner Name" value={sellerData.name} />
                      <DetailRow icon="mail" label="Email" value={sellerData.email} />
                      <DetailRow icon="call" label="Phone" value={sellerData.phone || sellerData.application?.phone || 'Not provided'} />
                      <DetailRow icon="calendar_today" label="Registered" value={formatDate(sellerData.createdAt)} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold text-[16px] text-text mb-2 pb-2 border-b border-border">Store Information</h3>
                      <DetailRow icon="storefront" label="Store Name" value={sellerData.storeProfile?.storeName || sellerData.application?.shopName} />
                      <DetailRow icon="description" label="Description" value={sellerData.storeProfile?.storeDescription || sellerData.application?.shopDescription} />
                      <DetailRow icon="location_on" label="Location" value={
                        sellerData.storeProfile?.location?.city 
                          ? `${sellerData.storeProfile.location.city}, ${sellerData.storeProfile.location.state}` 
                          : sellerData.application?.city
                      } />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Products */}
              {activeTab === 'products' && (
                <div className="animate-fade-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[16px] text-text">Recent Products</h3>
                    <span className="text-[13px] text-text-muted">{sellerData.businessStats?.productsListed || 0} Total</span>
                  </div>
                  
                  {sellerData.recentProducts && sellerData.recentProducts.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {sellerData.recentProducts.map(product => (
                        <div key={product._id} className="flex gap-4 p-3 border border-border rounded-xl bg-surface hover:bg-surface-sunken transition-colors">
                          <div className="w-16 h-16 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-muted">
                                <span className="material-symbols-outlined">image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-semibold text-[14px] text-text truncate mb-1">{product.name}</h4>
                            <div className="flex items-center gap-2 text-[12px] text-text-muted">
                              <span className="font-bold text-text">₹{product.price.toLocaleString()}</span>
                              <span>•</span>
                              <span>Stock: {product.stock}</span>
                            </div>
                            <div className="mt-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${product.status === 'active' ? 'bg-success/10 text-success' : 'bg-text-muted/10 text-text-muted'}`}>
                                {product.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-background rounded-xl border border-border border-dashed">
                      <span className="material-symbols-outlined text-text-muted text-4xl mb-2">inventory_2</span>
                      <p className="text-text-soft font-medium">No products listed yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Orders */}
              {activeTab === 'orders' && (
                <div className="animate-fade-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[16px] text-text">Recent Orders (Seller Portion)</h3>
                    <span className="text-[13px] text-text-muted">{sellerData.businessStats?.totalOrders || 0} Total</span>
                  </div>

                  {sellerData.recentOrders && sellerData.recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {sellerData.recentOrders.map(order => (
                        <div key={order._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-border rounded-xl bg-surface hover:bg-surface-sunken transition-colors gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[14px] font-mono font-bold text-text">#{order._id.slice(-8).toUpperCase()}</p>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-background text-text-soft border border-border uppercase tracking-wider">
                                {order.orderStatus.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[12px] text-text-muted">
                              {formatDate(order.createdAt)} • Buyer: <span className="font-medium text-text-soft">{order.buyerName}</span>
                            </p>
                          </div>
                          <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                            <p className="text-[16px] font-bold text-text">₹{order.totalAmount.toLocaleString()}</p>
                            <p className="text-[12px] text-text-muted">{order.itemCount} item(s)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-background rounded-xl border border-border border-dashed">
                      <span className="material-symbols-outlined text-text-muted text-4xl mb-2">receipt_long</span>
                      <p className="text-text-soft font-medium">No orders received yet.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : null}
        </div>
        
        {/* Footer Actions (Only for approved sellers) */}
        {sellerData && sellerData.role === 'seller' && (
          <div className="bg-surface border-t border-border px-6 py-4 flex justify-end gap-3 shrink-0">
             {sellerData.unifiedStatus === 'active' ? (
                <button
                  onClick={() => onStatusChange(sellerData)}
                  className="px-4 py-2 border border-danger/30 text-danger-content bg-white rounded-lg text-[13px] font-semibold hover:bg-danger-bg transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  Suspend Seller
                </button>
             ) : sellerData.unifiedStatus === 'suspended' ? (
                <button
                  onClick={() => onStatusChange(sellerData)}
                  className="px-4 py-2 border border-success/30 text-success bg-white rounded-lg text-[13px] font-semibold hover:bg-success/10 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Activate Seller
                </button>
             ) : null}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalSellers, setTotalSellers] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [dateRange, setDateRange] = useState('all');

  const searchTimeout = useRef(null);

  // Detail panel state
  const [selectedSellerId, setSelectedSellerId] = useState(null);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, action: null, seller: null, loading: false
  });
  const [rejectModal, setRejectModal] = useState({
    isOpen: false, seller: null, loading: false
  });

  // Toast state
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  // ── Fetch Sellers ────────────────────────────────────────────────────────────
  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSellerService.getSellers({
        page, limit, search, status, sort, dateRange
      });
      setSellers(data.sellers || []);
      setTotalSellers(data.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError('Failed to load sellers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, sort, dateRange]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 500);
  };

  // ── Actions ──────────────────────────────────────────────────────────────────

  const openStatusModal = (seller) => {
    const isSuspending = seller.unifiedStatus === 'active';
    setConfirmModal({
      isOpen: true,
      action: 'status',
      seller,
      loading: false,
      title: isSuspending ? 'Suspend Seller?' : 'Activate Seller?',
      message: isSuspending 
        ? `Are you sure you want to suspend ${seller.storeProfile?.storeName || seller.name}? Their store will be taken offline and they won't be able to receive new orders.`
        : `Are you sure you want to reactivate ${seller.storeProfile?.storeName || seller.name}? Their store and products will be visible again.`,
      confirmText: isSuspending ? 'Suspend Seller' : 'Activate Seller',
      isDestructive: isSuspending
    });
  };

  const openDeleteModal = (seller) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      seller,
      loading: false,
      title: 'Delete Seller Permanently?',
      message: `Are you sure you want to permanently delete ${seller.storeProfile?.storeName || seller.name}? This will remove their profile and products. Historical orders will be preserved for financial records.`,
      confirmText: 'Delete Seller',
      isDestructive: true
    });
  };

  const openRejectModal = (seller) => {
    setRejectModal({ isOpen: true, seller, loading: false });
  };

  const handleConfirmAction = async () => {
    const { action, seller } = confirmModal;
    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
      if (action === 'status') {
        const newStatus = seller.unifiedStatus === 'active' ? 'suspended' : 'active';
        await adminSellerService.updateSellerStatus(seller._id, newStatus);
        showToast(`Seller ${newStatus} successfully.`);
        fetchSellers(); // Refresh list to get updated stats
      } else if (action === 'delete') {
        await adminSellerService.deleteSeller(seller._id);
        showToast('Seller deleted successfully.');
        setSelectedSellerId(null);
        fetchSellers();
      }
      setConfirmModal({ isOpen: false, action: null, seller: null, loading: false });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Action failed.', 'error');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleApprove = async (applicationId) => {
    try {
      setConfirmModal(prev => ({ ...prev, loading: true })); // Reuse loading state flag conceptually, but let's just use local or ignore
      // To keep it simple, we'll just show toast loading or block UI
      await adminSellerService.approveApplication(applicationId);
      showToast('Seller approved successfully!');
      fetchSellers();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to approve seller.', 'error');
    }
  };

  const handleReject = async (note) => {
    const { seller } = rejectModal;
    setRejectModal(prev => ({ ...prev, loading: true }));
    try {
      if (seller.application && seller.application._id) {
         await adminSellerService.rejectApplication(seller.application._id, note);
         showToast('Application rejected.');
         fetchSellers();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to reject application.', 'error');
    } finally {
      setRejectModal({ isOpen: false, seller: null, loading: false });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pb-10 font-sans">
        
        {/* Header & Stats */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.14em] uppercase text-text-muted font-semibold mb-1">
            Admin Console
          </p>
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className="font-display text-[26px] font-semibold text-text flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">storefront</span>
                Sellers
              </h1>
              <p className="m-0 text-text-muted text-[13.5px]">
                Manage and monitor all sellers registered on VendorHub.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-hover">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Total Sellers</p>
              <p className="text-[20px] font-display font-bold text-text">{stats.total}</p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Active</p>
              <p className="text-[20px] font-display font-bold text-text">{stats.active}</p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
              <span className="material-symbols-outlined">hourglass_empty</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Pending</p>
              <p className="text-[20px] font-display font-bold text-text">{stats.pending}</p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-danger-bg flex items-center justify-center text-danger-content">
              <span className="material-symbols-outlined">block</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Suspended</p>
              <p className="text-[20px] font-display font-bold text-text">{stats.suspended}</p>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4 shadow-soft">
          <div className="flex-1 min-w-[250px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search sellers by store name, owner or email..." 
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text transition-colors"
            />
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>

            <select 
              value={sort} 
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2.5 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="storeAsc">Store A-Z</option>
              <option value="storeDesc">Store Z-A</option>
              <option value="earnings">Highest Earnings</option>
              <option value="orders">Most Orders</option>
            </select>

            <select 
              value={dateRange} 
              onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              className="px-3 py-2.5 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <div className="bg-danger-bg border border-danger/20 rounded-xl p-8 text-center shadow-soft">
            <span className="material-symbols-outlined text-danger-content text-4xl mb-2">error</span>
            <p className="text-danger-content font-medium mb-4">{error}</p>
            <button onClick={fetchSellers} className="px-5 py-2 bg-white text-text-soft border border-border rounded-lg text-sm font-semibold hover:bg-surface-sunken">
              Try Again
            </button>
          </div>
        ) : loading && sellers.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-5 animate-pulse space-y-3">
             {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-border rounded-lg" />)}
          </div>
        ) : sellers.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
              <span className="material-symbols-outlined text-3xl">store_off</span>
            </div>
            <h2 className="font-bold text-[18px] mb-1 text-text">No sellers found</h2>
            <p className="text-[14px] text-text-muted">Try changing your search or filter criteria.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-background border-b border-border text-text-muted uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Seller</th>
                    <th className="px-5 py-4">Store</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4 text-center">Products</th>
                    <th className="px-5 py-4 text-center">Orders</th>
                    <th className="px-5 py-4">Earnings</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sellers.map(seller => (
                    <tr key={seller._id} className="hover:bg-background/50 transition-colors">
                      {/* Seller Col */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {seller.avatar ? (
                            <img src={seller.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary-hover font-bold text-[12px] flex items-center justify-center shrink-0">
                              {getInitials(seller.name)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-text truncate max-w-[120px]">{seller.name}</p>
                          </div>
                        </div>
                      </td>
                      {/* Store Col */}
                      <td className="px-5 py-3 text-text-soft font-medium">
                        {seller.storeProfile?.storeName || seller.latestApplication?.shopName || '—'}
                      </td>
                      {/* Email Col */}
                      <td className="px-5 py-3 text-text-muted text-[12px]">{seller.email}</td>
                      {/* Products Col */}
                      <td className="px-5 py-3 text-center">
                        <span className="font-semibold text-text">{seller.totalProducts || 0}</span>
                      </td>
                      {/* Orders Col */}
                      <td className="px-5 py-3 text-center">
                        <span className="font-semibold text-text">{seller.totalOrders || 0}</span>
                      </td>
                      {/* Earnings Col */}
                      <td className="px-5 py-3 font-bold text-success">
                        ₹{(seller.totalEarnings || 0).toLocaleString()}
                      </td>
                      {/* Status Col */}
                      <td className="px-5 py-3">
                        <SellerStatusBadge status={seller.unifiedStatus} />
                      </td>
                      {/* Actions Col */}
                      <td className="px-5 py-3 text-right">
                        <div className="relative group inline-block text-left">
                          <button className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-border transition-colors">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-soft-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                            <button onClick={() => setSelectedSellerId(seller._id)} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                            </button>
                            
                            {seller.unifiedStatus === 'pending' && seller.latestApplication ? (
                              <>
                                <div className="border-t border-border"></div>
                                <button onClick={() => handleApprove(seller.latestApplication._id)} className="w-full text-left px-4 py-2.5 text-[13px] text-success hover:bg-success/10 transition-colors flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[16px]">verified</span> Approve Seller
                                </button>
                                <button onClick={() => openRejectModal(seller)} className="w-full text-left px-4 py-2.5 text-[13px] text-danger-content hover:bg-danger-bg transition-colors flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[16px]">cancel</span> Reject Seller
                                </button>
                              </>
                            ) : seller.role === 'seller' ? (
                              <>
                                <div className="border-t border-border"></div>
                                <button onClick={() => openStatusModal(seller)} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background transition-colors flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[16px]">
                                    {seller.unifiedStatus === 'active' ? 'block' : 'check_circle'}
                                  </span> 
                                  {seller.unifiedStatus === 'active' ? 'Suspend Seller' : 'Activate Seller'}
                                </button>
                              </>
                            ) : null}

                            <div className="border-t border-border"></div>
                            <button onClick={() => openDeleteModal(seller)} className="w-full text-left px-4 py-2.5 text-[13px] text-danger-content hover:bg-danger-bg transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">delete</span> Delete Seller
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalSellers > limit && (
              <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
                <span className="text-[13px] text-text-muted">
                  Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, totalSellers)} of {totalSellers} sellers
                </span>
                <div className="flex items-center gap-2">
                  <select 
                    value={limit} 
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="px-2 py-1.5 mr-2 text-[12px] border border-border rounded-md bg-surface text-text focus:outline-none"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded border border-border bg-surface text-text-soft disabled:opacity-50 hover:bg-surface-sunken transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= totalSellers}
                    className="p-1.5 rounded border border-border bg-surface text-text-soft disabled:opacity-50 hover:bg-surface-sunken transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <SellerDetailPanel 
        sellerId={selectedSellerId} 
        onClose={() => setSelectedSellerId(null)}
        onStatusChange={openStatusModal}
        onApprove={handleApprove}
        onRejectClick={openRejectModal}
        loadingAction={confirmModal.loading || rejectModal.loading}
      />
      
      <ConfirmModal 
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
      />

      <RejectModal
        isOpen={rejectModal.isOpen}
        loading={rejectModal.loading}
        onClose={() => setRejectModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleReject}
      />

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg text-[13.5px] font-semibold transition-all duration-200 pointer-events-none z-50 flex items-center gap-2 shadow-brand ${
        toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${toast.type === 'error' ? 'bg-danger text-white' : 'bg-ink text-white'}`}>
        <span className="material-symbols-outlined text-[18px]">
          {toast.type === 'error' ? 'cancel' : 'check_circle'}
        </span>
        {toast.msg}
      </div>
    </>
  );
}
