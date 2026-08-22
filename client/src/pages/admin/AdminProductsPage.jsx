import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminProductService } from '../../services/adminProductService';

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

function renderStars(rating) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`f-${i}`} className="material-symbols-outlined text-brand-500 text-[14px]">star</span>);
  }
  if (hasHalfStar) {
    stars.push(<span key="h" className="material-symbols-outlined text-brand-500 text-[14px]">star_half</span>);
  }
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`e-${i}`} className="material-symbols-outlined text-text-muted/30 text-[14px]">star</span>);
  }
  return <div className="flex items-center">{stars}</div>;
}

// ─── UI Components ────────────────────────────────────────────────────────────

function ProductStatusBadge({ status }) {
  let bgClass, textClass, label;

  switch (status) {
    case 'active':
      bgClass = 'bg-[#E6F2E9]';
      textClass = 'text-[#1E7A3E]';
      label = 'Active';
      break;
    case 'inactive':
    case 'draft':
      bgClass = 'bg-surface-sunken';
      textClass = 'text-text-muted';
      label = 'Inactive';
      break;
    case 'blocked':
      bgClass = 'bg-danger-bg';
      textClass = 'text-danger-content';
      label = 'Blocked';
      break;
    default:
      bgClass = 'bg-surface-sunken';
      textClass = 'text-text-soft';
      label = status;
      break;
  }

  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${bgClass} ${textClass} uppercase tracking-wider`}>
      {label}
    </span>
  );
}

function StockStatusIndicator({ stock, lowStockThreshold }) {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-1.5 text-danger-content">
        <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
        <span className="font-semibold">{stock} (Out of Stock)</span>
      </div>
    );
  } else if (stock <= lowStockThreshold) {
    return (
      <div className="flex items-center gap-1.5 text-brand-600">
        <span className="w-2 h-2 rounded-full bg-brand-500" />
        <span className="font-semibold">{stock} (Low Stock)</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-success">
      <span className="w-2 h-2 rounded-full bg-success" />
      <span className="font-semibold">{stock} (In Stock)</span>
    </div>
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

function DetailRow({ label, value, vertical = false }) {
  if (vertical) {
    return (
      <div className="mb-4">
        <p className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-1">{label}</p>
        <div className="text-[13.5px] text-text">{value || '—'}</div>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between py-2 border-b border-border/50 last:border-0 gap-4">
      <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wide shrink-0 mt-0.5">{label}</span>
      <span className="text-[13.5px] text-text text-right font-medium">{value || '—'}</span>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function ProductDetailPanel({ productId, onClose, onStatusChange, onDeleteClick }) {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, sales, reviews
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchDetails = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const data = await adminProductService.getProductById(productId);
      setProductData(data.product);
      setSelectedImage(0);
    } catch (err) {
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-surface border-l border-border w-full max-w-[800px] h-full overflow-hidden shadow-soft-lg z-10 flex flex-col">
        
        {/* Header */}
        <div className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="font-display font-bold text-[20px] text-text flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            Product Details
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
          ) : productData ? (
            <div className="p-6">
              
              {/* Product Header / Hero */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Image Gallery */}
                <div className="w-full md:w-1/3 shrink-0">
                  <div className="aspect-square rounded-xl border border-border bg-background overflow-hidden mb-3 relative">
                    {productData.images && productData.images.length > 0 ? (
                      <img src={productData.images[selectedImage]} alt={productData.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                  </div>
                  {productData.images && productData.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {productData.images.map((img, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setSelectedImage(idx)}
                          className={`w-12 h-12 rounded-lg border overflow-hidden shrink-0 transition-all ${selectedImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-70 hover:opacity-100'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Core Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h2 className="font-display font-bold text-[24px] text-text leading-tight">{productData.name}</h2>
                    <div className="shrink-0"><ProductStatusBadge status={productData.status} /></div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[13px] text-text-soft mb-4">
                    <span className="bg-surface-sunken px-2 py-0.5 rounded border border-border font-medium">{productData.category}</span>
                    {productData.sku && <span className="font-mono text-text-muted">SKU: {productData.sku}</span>}
                  </div>

                  <div className="flex items-end gap-3 mb-6">
                    <span className="font-display font-bold text-[28px] text-text leading-none">₹{productData.price.toLocaleString()}</span>
                    {productData.originalPrice && productData.originalPrice > productData.price && (
                      <span className="text-[16px] text-text-muted line-through font-medium mb-1">₹{productData.originalPrice.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="bg-surface-sunken rounded-xl p-4 border border-border mb-4">
                    <StockStatusIndicator stock={productData.stock} lowStockThreshold={productData.lowStockThreshold} />
                    {productData.stock <= productData.lowStockThreshold && (
                      <p className="text-[12px] text-text-muted mt-1">Threshold is set to {productData.lowStockThreshold} units.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border mb-6">
                {['overview', 'sales', 'reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-[14px] font-semibold capitalize border-b-2 transition-colors ${
                      activeTab === tab 
                        ? 'border-primary text-primary-hover' 
                        : 'border-transparent text-text-muted hover:text-text'
                    }`}
                  >
                    {tab === 'sales' ? 'Orders & Sales' : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-up">
                  
                  {/* Performance Grid */}
                  <div>
                    <h3 className="font-bold text-[16px] text-text mb-4">Performance</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
                        <p className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Units Sold</p>
                        <p className="text-[20px] font-display font-bold text-text">{productData.performance?.unitsSold || 0}</p>
                      </div>
                      <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
                        <p className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Revenue</p>
                        <p className="text-[20px] font-display font-bold text-success">₹{productData.performance?.revenueGenerated?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
                        <p className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Total Orders</p>
                        <p className="text-[20px] font-display font-bold text-text">{productData.performance?.totalOrders || 0}</p>
                      </div>
                      <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
                        <p className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Avg Rating</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[20px] font-display font-bold text-brand-600">{productData.performance?.avgRating?.toFixed(1) || '0.0'}</p>
                          <span className="text-[12px] text-text-muted">({productData.performance?.totalReviews || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Description */}
                    <div>
                      <h3 className="font-bold text-[16px] text-text mb-4 pb-2 border-b border-border">Description</h3>
                      <div className="text-[13.5px] text-text-soft whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {productData.description}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div>
                      <h3 className="font-bold text-[16px] text-text mb-4 pb-2 border-b border-border">Details</h3>
                      <div className="bg-surface-sunken p-4 rounded-xl border border-border">
                        <DetailRow label="Seller" value={
                          <div className="flex items-center gap-2 text-right justify-end">
                            {productData.seller?.avatar && <img src={productData.seller.avatar} className="w-5 h-5 rounded-full" alt="" />}
                            <span>{productData.seller?.storeName || productData.seller?.name}</span>
                          </div>
                        } />
                        <DetailRow label="Category" value={`${productData.category} ${productData.subcategory ? `> ${productData.subcategory}` : ''}`} />
                        <DetailRow label="Created On" value={formatDate(productData.createdAt)} />
                        <DetailRow label="Last Updated" value={formatDate(productData.updatedAt)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Sales */}
              {activeTab === 'sales' && (
                <div className="animate-fade-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[16px] text-text">Recent Orders</h3>
                    <span className="text-[13px] text-text-muted">{productData.performance?.totalOrders || 0} Total</span>
                  </div>

                  {productData.recentOrders && productData.recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {productData.recentOrders.map(order => (
                        <div key={order._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-border rounded-xl bg-surface hover:bg-surface-sunken transition-colors gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[14px] font-mono font-bold text-text">#{order._id.slice(-8).toUpperCase()}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                order.orderStatus === 'delivered' ? 'bg-success/10 text-success' : 
                                order.orderStatus === 'cancelled' ? 'bg-danger-bg text-danger-content' : 'bg-brand-50 text-brand-700'
                              }`}>
                                {order.orderStatus.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[12px] text-text-muted">
                              {formatDate(order.createdAt)} • Buyer: <span className="font-medium text-text-soft">{order.buyerName}</span>
                            </p>
                          </div>
                          <div className="text-left sm:text-right w-full sm:w-auto">
                            <p className="text-[16px] font-bold text-text mb-1">₹{order.totalAmount.toLocaleString()}</p>
                            <p className="text-[12px] font-semibold text-text-soft">{order.quantity} unit(s) purchased</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-background rounded-xl border border-border border-dashed">
                      <span className="material-symbols-outlined text-text-muted text-4xl mb-2">receipt_long</span>
                      <p className="text-text-soft font-medium">No sales recorded yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Reviews */}
              {activeTab === 'reviews' && (
                <div className="animate-fade-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[16px] text-text">Recent Reviews</h3>
                    <div className="flex items-center gap-3">
                      {renderStars(productData.performance?.avgRating || 0)}
                      <span className="text-[13px] font-semibold text-text-soft">
                        {productData.performance?.avgRating?.toFixed(1) || '0.0'} ({productData.performance?.totalReviews || 0})
                      </span>
                    </div>
                  </div>

                  {productData.recentReviews && productData.recentReviews.length > 0 ? (
                    <div className="space-y-4">
                      {productData.recentReviews.map(review => (
                        <div key={review._id} className="p-4 border border-border rounded-xl bg-surface">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary-hover font-bold text-[11px] flex items-center justify-center shrink-0">
                                {getInitials(review.buyer?.name)}
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-text leading-none mb-1">{review.buyer?.name || 'User'}</p>
                                <p className="text-[11px] text-text-muted">{formatDate(review.createdAt)}</p>
                              </div>
                            </div>
                            <div>{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-[13.5px] text-text-soft mt-3 italic">"{review.comment}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-background rounded-xl border border-border border-dashed">
                      <span className="material-symbols-outlined text-text-muted text-4xl mb-2">reviews</span>
                      <p className="text-text-soft font-medium">No reviews yet.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : null}
        </div>
        
        {/* Footer Actions */}
        {productData && (
          <div className="bg-surface border-t border-border px-6 py-4 flex justify-end gap-3 shrink-0">
             {productData.status !== 'blocked' ? (
                <button
                  onClick={() => onStatusChange(productData, 'blocked')}
                  className="px-4 py-2 border border-danger/30 text-danger-content bg-white rounded-lg text-[13px] font-semibold hover:bg-danger-bg transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  Block Product
                </button>
             ) : (
                <button
                  onClick={() => onStatusChange(productData, 'active')}
                  className="px-4 py-2 border border-success/30 text-success bg-white rounded-lg text-[13px] font-semibold hover:bg-success/10 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Unblock (Activate)
                </button>
             )}
             
             {productData.status === 'active' && (
                <button
                  onClick={() => onStatusChange(productData, 'inactive')}
                  className="px-4 py-2 border border-border text-text bg-white rounded-lg text-[13px] font-semibold hover:bg-surface-sunken transition-colors"
                >
                  Deactivate
                </button>
             )}

             {(productData.status === 'inactive' || productData.status === 'draft') && (
                <button
                  onClick={() => onStatusChange(productData, 'active')}
                  className="px-4 py-2 border border-success/30 text-success bg-white rounded-lg text-[13px] font-semibold hover:bg-success/10 transition-colors"
                >
                  Activate
                </button>
             )}

             <button
               onClick={() => onDeleteClick(productData)}
               className="px-4 py-2 bg-danger text-white rounded-lg text-[13px] font-bold hover:bg-danger/90 transition-colors ml-4"
             >
               Delete
             </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, lowStock: 0, outOfStock: 0 });
  const [filterOptions, setFilterOptions] = useState({ categories: [], sellers: [] });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [seller, setSeller] = useState('all');
  const [status, setStatus] = useState('all');
  const [stock, setStock] = useState('all');
  const [sort, setSort] = useState('newest');

  const searchTimeout = useRef(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, action: null, product: null, targetStatus: null, loading: false
  });
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  // Fetch Filters Options once
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await adminProductService.getFilters();
        setFilterOptions({ categories: data.categories || [], sellers: data.sellers || [] });
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminProductService.getProducts({
        page, limit, search, category, seller, status, stock, sort
      });
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError('Failed to load products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, seller, status, stock, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 500);
  };

  // Actions
  const handleStatusChangeRequest = (product, targetStatus) => {
    if (targetStatus === 'blocked') {
      setConfirmModal({
        isOpen: true,
        action: 'status',
        product,
        targetStatus,
        loading: false,
        title: 'Block this product?',
        message: `Are you sure you want to block "${product.name}"? It will no longer be visible to buyers and the seller will not be able to activate it.`,
        confirmText: 'Block Product',
        isDestructive: true
      });
    } else {
      // Direct update for activate/deactivate without modal to save time, or use modal. Let's use modal for consistency but maybe less scary text.
      executeStatusUpdate(product._id, targetStatus);
    }
  };

  const handleDeleteRequest = (product) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      product,
      loading: false,
      title: 'Delete this product permanently?',
      message: `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone. Historical order records will NOT be corrupted.`,
      confirmText: 'Delete Product',
      isDestructive: true
    });
  };

  const executeStatusUpdate = async (id, newStatus) => {
    try {
      if (confirmModal.isOpen) setConfirmModal(prev => ({ ...prev, loading: true }));
      await adminProductService.updateProductStatus(id, newStatus);
      showToast(`Product marked as ${newStatus}.`);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      if (selectedProductId === id) setSelectedProductId(null); // close drawer to refresh or we can refresh detail. Simpler to close.
      fetchProducts();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update status.', 'error');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const executeDelete = async (id) => {
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      await adminProductService.deleteProduct(id);
      showToast('Product deleted successfully.');
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      if (selectedProductId === id) setSelectedProductId(null);
      fetchProducts();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete product.', 'error');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const onModalConfirm = () => {
    if (confirmModal.action === 'status') {
      executeStatusUpdate(confirmModal.product._id, confirmModal.targetStatus);
    } else if (confirmModal.action === 'delete') {
      executeDelete(confirmModal.product._id);
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
          <h1 className="font-display text-[26px] font-semibold text-text flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            Products
          </h1>
          <p className="m-0 text-text-muted text-[13.5px]">
            Manage and monitor all products listed by sellers on VendorHub.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-hover">
              <span className="material-symbols-outlined">dataset</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Total Products</p>
              <p className="text-[20px] font-display font-bold text-text">{stats.total}</p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Active</p>
              <p className="text-[20px] font-display font-bold text-text">{stats.active}</p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Low Stock</p>
              <p className="text-[20px] font-display font-bold text-text">{stats.lowStock}</p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-danger-bg flex items-center justify-center text-danger-content">
              <span className="material-symbols-outlined">production_quantity_limits</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Out of Stock</p>
              <p className="text-[20px] font-display font-bold text-text">{stats.outOfStock}</p>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3 shadow-soft">
          <div className="flex-1 min-w-[250px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text transition-colors"
            />
          </div>
          
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary">
            <option value="all">All Categories</option>
            {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={seller} onChange={(e) => { setSeller(e.target.value); setPage(1); }} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary max-w-[150px] truncate">
            <option value="all">All Sellers</option>
            {filterOptions.sellers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>

          <select value={stock} onChange={(e) => { setStock(e.target.value); setPage(1); }} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary">
            <option value="all">All Stock</option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>

          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="salesDesc">Most Sold</option>
            <option value="ratingDesc">Highest Rated</option>
          </select>
        </div>

        {/* Content Area */}
        {error ? (
          <div className="bg-danger-bg border border-danger/20 rounded-xl p-8 text-center shadow-soft">
            <span className="material-symbols-outlined text-danger-content text-4xl mb-2">error</span>
            <p className="text-danger-content font-medium mb-4">{error}</p>
            <button onClick={fetchProducts} className="px-5 py-2 bg-white text-text-soft border border-border rounded-lg text-sm font-semibold hover:bg-surface-sunken">
              Try Again
            </button>
          </div>
        ) : loading && products.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-5 animate-pulse space-y-3">
             {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-border rounded-lg" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
              <span className="material-symbols-outlined text-3xl">inventory_2</span>
            </div>
            <h2 className="font-bold text-[18px] mb-1 text-text">No products found</h2>
            <p className="text-[14px] text-text-muted">Try changing your search or filter criteria.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-background border-b border-border text-text-muted uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Seller</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4 text-right">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4 text-center">Sales</th>
                    <th className="px-5 py-4">Rating</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map(product => (
                    <tr key={product._id} className="hover:bg-background/50 transition-colors">
                      {/* Product Col */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-muted">
                                <span className="material-symbols-outlined text-[18px]">image</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <p className="font-semibold text-text truncate">{product.name}</p>
                            {product.sku && <p className="text-[11px] text-text-muted font-mono truncate">SKU: {product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      {/* Seller Col */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-primary/10 text-primary-hover font-bold text-[10px] flex items-center justify-center shrink-0">
                              {getInitials(product.storeProfile?.storeName || product.sellerObj?.name)}
                           </div>
                           <span className="font-medium text-text-soft truncate max-w-[120px]">
                             {product.storeProfile?.storeName || product.sellerObj?.name}
                           </span>
                        </div>
                      </td>
                      {/* Category Col */}
                      <td className="px-5 py-3 text-text-soft">
                        <span className="bg-surface-sunken px-2 py-1 rounded border border-border text-[12px]">{product.category}</span>
                      </td>
                      {/* Price Col */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex flex-col items-end justify-center">
                          <span className="font-bold text-text">₹{product.price.toLocaleString()}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10.5px] text-text-muted line-through">₹{product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                      </td>
                      {/* Stock Col */}
                      <td className="px-5 py-3">
                        {product.stock === 0 ? (
                          <span className="flex items-center gap-1.5 text-danger-content font-semibold text-[12px]">
                            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" /> Out of stock
                          </span>
                        ) : product.stock <= product.lowStockThreshold ? (
                          <span className="flex items-center gap-1.5 text-brand-600 font-semibold text-[12px]">
                            <span className="w-2 h-2 rounded-full bg-brand-500" /> Low ({product.stock})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-success font-semibold text-[12px]">
                            <span className="w-2 h-2 rounded-full bg-success" /> In Stock ({product.stock})
                          </span>
                        )}
                      </td>
                      {/* Sales Col */}
                      <td className="px-5 py-3 text-center">
                        <span className="font-bold text-text">{product.totalSales || 0}</span>
                      </td>
                      {/* Rating Col */}
                      <td className="px-5 py-3">
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-brand-500 text-[14px]">star</span>
                            <span className="font-bold text-text text-[12.5px]">{product.avgRating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span className="text-[10px] text-text-muted">({product.reviewCount} revs)</span>
                        </div>
                      </td>
                      {/* Status Col */}
                      <td className="px-5 py-3">
                        <ProductStatusBadge status={product.status} />
                      </td>
                      {/* Actions Col */}
                      <td className="px-5 py-3 text-right">
                        <div className="relative group inline-block text-left">
                          <button className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-border transition-colors">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-soft-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                            <button onClick={() => setSelectedProductId(product._id)} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                            </button>
                            
                            <div className="border-t border-border"></div>
                            {product.status !== 'blocked' ? (
                               <button onClick={() => handleStatusChangeRequest(product, 'blocked')} className="w-full text-left px-4 py-2.5 text-[13px] text-danger-content hover:bg-danger-bg transition-colors flex items-center gap-2">
                                 <span className="material-symbols-outlined text-[16px]">block</span> Block Product
                               </button>
                            ) : (
                               <button onClick={() => handleStatusChangeRequest(product, 'active')} className="w-full text-left px-4 py-2.5 text-[13px] text-success hover:bg-success/10 transition-colors flex items-center gap-2">
                                 <span className="material-symbols-outlined text-[16px]">check_circle</span> Unblock
                               </button>
                            )}

                            {product.status === 'active' && (
                               <button onClick={() => handleStatusChangeRequest(product, 'inactive')} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background transition-colors flex items-center gap-2">
                                 <span className="material-symbols-outlined text-[16px]">pause</span> Deactivate
                               </button>
                            )}
                            
                            <div className="border-t border-border"></div>
                            <button onClick={() => handleDeleteRequest(product)} className="w-full text-left px-4 py-2.5 text-[13px] text-danger-content hover:bg-danger-bg transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">delete</span> Delete Product
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
            {totalProducts > limit && (
              <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
                <span className="text-[13px] text-text-muted">
                  Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, totalProducts)} of {totalProducts} products
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
                    disabled={page * limit >= totalProducts}
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

      <ProductDetailPanel 
        productId={selectedProductId} 
        onClose={() => setSelectedProductId(null)}
        onStatusChange={handleStatusChangeRequest}
        onDeleteClick={handleDeleteRequest}
      />
      
      <ConfirmModal 
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={onModalConfirm}
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
