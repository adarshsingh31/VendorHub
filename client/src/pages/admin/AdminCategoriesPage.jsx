import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminCategoryService } from '../../services/adminCategoryService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
      status === 'active'
        ? 'bg-[#E6F2E9] text-[#1E7A3E]'
        : 'bg-surface-sunken text-text-muted'
    }`}>
      {status}
    </span>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ isOpen, title, message, confirmText, isDestructive, onClose, onConfirm, loading, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-surface rounded-2xl shadow-soft-lg w-full max-w-md p-6 z-10 border border-border">
        <h3 className="font-display font-bold text-[20px] text-text mb-2">{title}</h3>
        <p className="text-text-muted text-[14px] mb-4">{message}</p>
        {children}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 text-[13px] font-semibold text-text-soft bg-surface border border-border rounded-lg hover:bg-surface-sunken">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`px-4 py-2 text-[13px] font-bold text-white rounded-lg flex items-center gap-2 ${isDestructive ? 'bg-danger hover:bg-danger/90' : 'bg-primary-hover'}`}>
            {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Form Modal ──────────────────────────────────────────────────────

function CategoryFormModal({ isOpen, onClose, onSave, editData, allCategories }) {
  const [form, setForm] = useState({ name: '', description: '', parent: '', status: 'active', displayOrder: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isEdit = !!editData;

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({
          name: editData.name || '',
          description: editData.description || '',
          parent: editData.parent?._id || editData.parent || '',
          status: editData.status || 'active',
          displayOrder: editData.displayOrder ?? '',
        });
        setImagePreview(editData.image || '');
      } else {
        setForm({ name: '', description: '', parent: '', status: 'active', displayOrder: '' });
        setImagePreview('');
      }
      setImageFile(null);
      setError('');
    }
  }, [isOpen, editData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Category name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description);
      fd.append('parent', form.parent || '');
      fd.append('status', form.status);
      if (form.displayOrder !== '') fd.append('displayOrder', form.displayOrder);
      if (imageFile) fd.append('image', imageFile);

      if (isEdit) {
        await adminCategoryService.updateCategory(editData._id, fd);
      } else {
        await adminCategoryService.createCategory(fd);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Filter out sub-sub-levels and the category being edited from the parent picker
  const parentOptions = allCategories.filter(c =>
    !c.parent && (!editData || c._id !== editData._id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-surface rounded-2xl shadow-soft-lg w-full max-w-lg p-6 z-10 border border-border">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-bold text-[20px] text-text">
            {isEdit ? 'Edit Category' : 'Add Category'}
          </h3>
          <button onClick={onClose} disabled={loading} className="text-text-muted hover:text-text p-1 rounded-lg">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Image Upload */}
          <div>
            <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-2">Category Image</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-background cursor-pointer hover:border-primary transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-text-muted text-[28px]">add_photo_alternate</span>
                )}
              </div>
              <div>
                <button onClick={() => fileInputRef.current?.click()} className="text-[13px] text-primary font-semibold hover:underline">
                  {imagePreview ? 'Replace Image' : 'Upload Image'}
                </button>
                <p className="text-[11px] text-text-muted">PNG, JPG up to 5MB</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-1.5">Category Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Electronics"
              className="w-full px-4 py-2.5 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Short description of this category..."
              className="w-full px-4 py-2.5 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text transition-colors resize-none"
            />
          </div>

          {/* Parent Category */}
          <div>
            <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-1.5">Parent Category</label>
            <select
              value={form.parent}
              onChange={e => setForm(p => ({ ...p, parent: e.target.value }))}
              className="w-full px-4 py-2.5 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text"
            >
              <option value="">None (Top-Level Category)</option>
              {parentOptions.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {form.parent && <p className="text-[11px] text-text-muted mt-1">This will create a subcategory.</p>}
          </div>

          {/* Status & Display Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-2.5 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-1.5">Display Order</label>
              <input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={e => setForm(p => ({ ...p, displayOrder: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-2.5 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text"
              />
            </div>
          </div>

          {error && (
            <div className="bg-danger-bg border border-danger/20 rounded-lg px-4 py-2.5 text-[13px] text-danger-content font-medium">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-border">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-[13px] font-semibold text-text-soft border border-border rounded-lg hover:bg-surface-sunken">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 text-[13px] font-bold text-white bg-primary hover:bg-primary-hover rounded-lg flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function CategoryDetailDrawer({ categoryId, onClose, onEdit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await adminCategoryService.getCategoryById(categoryId);
        setData(res.category);
      } catch {
        setError('Failed to load category details.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [categoryId]);

  if (!categoryId) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-surface border-l border-border w-full max-w-lg h-full overflow-hidden shadow-soft-lg z-10 flex flex-col">
        {/* Header */}
        <div className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="font-display font-bold text-[20px] text-text flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">category</span> Category Details
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-sunken"><span className="material-symbols-outlined text-[22px]">close</span></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full"><span className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
          ) : error ? (
            <div className="p-8 text-center text-danger-content font-medium">{error}</div>
          ) : data ? (
            <div className="p-6 space-y-6">
              {/* Hero */}
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 rounded-xl border border-border overflow-hidden bg-background flex items-center justify-center shrink-0">
                  {data.image ? <img src={data.image} alt="" className="w-full h-full object-cover" /> : (
                    <span className="font-bold text-xl text-primary">{getInitials(data.name)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-display font-bold text-[22px] text-text">{data.name}</h2>
                    <StatusBadge status={data.status} />
                  </div>
                  <p className="text-[13px] text-text-muted">
                    {data.parent ? `Subcategory of: ${data.parent.name}` : 'Top-level Category'}
                  </p>
                </div>
                <button onClick={() => onEdit(data)} className="px-3 py-1.5 border border-border rounded-lg text-[12px] font-semibold text-text hover:bg-surface-sunken flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[15px]">edit</span> Edit
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Products', value: data.stats?.productCount || 0, icon: 'inventory_2', color: 'text-primary-hover' },
                  { label: 'Sellers', value: data.stats?.sellerCount || 0, icon: 'storefront', color: 'text-success' },
                  { label: 'Active Products', value: data.stats?.activeProducts || 0, icon: 'check_circle', color: 'text-success' },
                  { label: 'Out of Stock', value: data.stats?.outOfStock || 0, icon: 'production_quantity_limits', color: 'text-danger-content' },
                ].map(s => (
                  <div key={s.label} className="bg-surface-sunken border border-border rounded-xl p-4 flex items-center gap-3">
                    <span className={`material-symbols-outlined ${s.color} text-[22px]`}>{s.icon}</span>
                    <div>
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">{s.label}</p>
                      <p className="text-[18px] font-display font-bold text-text">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="space-y-3 bg-background rounded-xl p-4 border border-border">
                <h4 className="font-bold text-[14px] text-text mb-3">Category Info</h4>
                {data.description && <p className="text-[13.5px] text-text-soft">{data.description}</p>}
                <div className="flex justify-between py-1.5 border-b border-border/50 text-[13px]">
                  <span className="text-text-muted font-semibold">Type</span>
                  <span className="text-text font-medium">{data.parent ? 'Subcategory' : 'Parent Category'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50 text-[13px]">
                  <span className="text-text-muted font-semibold">Created</span>
                  <span className="text-text font-medium">{formatDate(data.createdAt)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-[13px]">
                  <span className="text-text-muted font-semibold">Last Updated</span>
                  <span className="text-text font-medium">{formatDate(data.updatedAt)}</span>
                </div>
              </div>

              {/* Subcategories */}
              {!data.parent && (
                <div>
                  <h4 className="font-bold text-[14px] text-text mb-3 flex items-center justify-between">
                    Subcategories
                    <span className="text-[12px] font-normal text-text-muted">{data.subcategories?.length || 0} total</span>
                  </h4>
                  {data.subcategories?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.subcategories.map(sub => (
                        <span key={sub._id} className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg text-[13px] font-medium text-text">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {sub.name}
                          {sub.status === 'inactive' && <span className="text-[10px] text-text-muted">(inactive)</span>}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-text-muted italic">No subcategories yet.</p>
                  )}
                </div>
              )}

              {/* Recent Products */}
              {data.recentProducts?.length > 0 && (
                <div>
                  <h4 className="font-bold text-[14px] text-text mb-3">Recent Products</h4>
                  <div className="space-y-2">
                    {data.recentProducts.map(product => (
                      <div key={product._id} className="flex items-center gap-3 p-2.5 border border-border rounded-lg bg-surface hover:bg-surface-sunken transition-colors">
                        <div className="w-9 h-9 rounded-lg border border-border overflow-hidden bg-background shrink-0">
                          {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-text-muted text-[18px] m-1.5">image</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[13px] text-text truncate">{product.name}</p>
                          <p className="text-[11px] text-text-muted">{product.seller?.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-bold text-text">₹{product.price.toLocaleString()}</p>
                          <p className="text-[10px] text-text-muted">Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // unfiltered, for parent picker
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalProducts: 0, empty: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('newest');

  const searchTimeout = useRef(null);

  // Form / Detail state
  const [formModal, setFormModal] = useState({ open: false, editData: null });
  const [detailId, setDetailId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [moveModal, setMoveModal] = useState({ open: false, category: null });
  const [moveTarget, setMoveTarget] = useState('');

  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async (resetAll = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminCategoryService.getCategories({ page, limit, search, status, type, sort });
      setCategories(data.categories || []);
      setTotal(data.total || 0);
      if (data.stats) setStats(data.stats);
      if (resetAll) {
        // Also refresh the full list for parent picker
        const all = await adminCategoryService.getCategories({ limit: 200, page: 1 });
        setAllCategories(all.categories || []);
      }
    } catch {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, type, sort]);

  useEffect(() => { fetchCategories(true); }, [fetchCategories]);

  const handleSearch = e => {
    const val = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  };

  // ── Actions ──────────────────────────────────────────────────────────────────

  const openStatusModal = (cat) => {
    const isActivating = cat.status === 'inactive';
    setConfirmModal({
      open: true,
      action: 'status',
      category: cat,
      loading: false,
      title: isActivating ? 'Activate Category?' : 'Deactivate Category?',
      message: isActivating
        ? `"${cat.name}" will become available for new product listings.`
        : `"${cat.name}" will be hidden from sellers and buyers. Existing products remain intact.`,
      confirmText: isActivating ? 'Activate' : 'Deactivate',
      isDestructive: !isActivating,
    });
  };

  const openDeleteModal = (cat) => {
    setConfirmModal({
      open: true,
      action: 'delete',
      category: cat,
      loading: false,
      title: 'Delete Category?',
      message: `Are you sure you want to permanently delete "${cat.name}"? This cannot be undone.`,
      confirmText: 'Delete',
      isDestructive: true,
    });
  };

  const handleConfirm = async () => {
    const { action, category } = confirmModal;
    setConfirmModal(p => ({ ...p, loading: true }));
    try {
      if (action === 'status') {
        const newStatus = category.status === 'active' ? 'inactive' : 'active';
        await adminCategoryService.updateCategoryStatus(category._id, newStatus);
        showToast(`Category ${newStatus}.`);
      } else if (action === 'delete') {
        await adminCategoryService.deleteCategory(category._id);
        showToast('Category deleted.');
      }
      setConfirmModal({ open: false });
      fetchCategories(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Action failed.';
      const code = err?.response?.data?.code;
      if (code === 'HAS_PRODUCTS') {
        setConfirmModal({ open: false });
        setMoveModal({ open: true, category: confirmModal.category });
      } else {
        showToast(msg, 'error');
        setConfirmModal(p => ({ ...p, loading: false }));
      }
    }
  };

  const handleMoveProducts = async () => {
    if (!moveTarget) { showToast('Select a target category', 'error'); return; }
    try {
      const res = await adminCategoryService.moveProducts(moveModal.category._id, moveTarget);
      showToast(res.message || 'Products moved successfully.');
      setMoveModal({ open: false, category: null });
      setMoveTarget('');
      fetchCategories(true);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to move products.', 'error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const moveTargetOptions = allCategories.filter(
    c => moveModal.category && c._id !== moveModal.category._id
  );

  return (
    <>
      <div className="pb-10 font-sans">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-text-muted font-semibold mb-1">Admin Console</p>
            <h1 className="font-display text-[26px] font-semibold text-text flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">category</span>Categories
            </h1>
            <p className="text-text-muted text-[13.5px]">Manage product categories and organize the VendorHub marketplace.</p>
          </div>
          <button
            onClick={() => setFormModal({ open: true, editData: null })}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-[13px] transition-colors shadow-brand"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Category
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: 'category', color: 'text-primary-hover', bg: 'bg-primary/10' },
            { label: 'Active', value: stats.active, icon: 'check_circle', color: 'text-success', bg: 'bg-success/10' },
            { label: 'Inactive', value: stats.inactive, icon: 'pause_circle', color: 'text-text-muted', bg: 'bg-surface-sunken' },
            { label: 'Total Products', value: stats.totalProducts, icon: 'inventory_2', color: 'text-brand-600', bg: 'bg-brand-50' },
            { label: 'Empty', value: stats.empty, icon: 'inbox', color: 'text-danger-content', bg: 'bg-danger-bg' },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${s.color} text-[20px]`}>{s.icon}</span>
              </div>
              <div>
                <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide leading-tight">{s.label}</p>
                <p className="text-[18px] font-display font-bold text-text">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Toolbar */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3 shadow-soft">
          <div className="flex-1 min-w-[220px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search categories..."
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text transition-colors"
            />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary">
            <option value="all">All Types</option>
            <option value="parent">Parent Categories</option>
            <option value="sub">Subcategories</option>
          </select>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="nameAsc">Name A–Z</option>
            <option value="nameDesc">Name Z–A</option>
            <option value="products">Most Products</option>
          </select>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-danger-bg border border-danger/20 rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-danger-content text-4xl mb-2">error</span>
            <p className="text-danger-content font-medium mb-4">{error}</p>
            <button onClick={() => fetchCategories(true)} className="px-5 py-2 bg-white text-text-soft border border-border rounded-lg text-sm font-semibold hover:bg-surface-sunken">Try Again</button>
          </div>
        ) : loading && categories.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-5 animate-pulse space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-border rounded-lg" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">category</span>
            </div>
            <h2 className="font-bold text-[18px] mb-1 text-text">No categories found</h2>
            <p className="text-[14px] text-text-muted mb-4">Create your first category to organize products on VendorHub.</p>
            <button onClick={() => setFormModal({ open: true, editData: null })} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-[13px] hover:bg-primary-hover">
              + Add Category
            </button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-background border-b border-border text-text-muted uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Parent</th>
                    <th className="px-5 py-4 text-center">Products</th>
                    <th className="px-5 py-4 text-center">Sellers</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map(cat => (
                    <tr key={cat._id} className="hover:bg-background/50 transition-colors">
                      {/* Category */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {cat.parent && <span className="text-text-muted/40 font-mono text-[16px] select-none">└</span>}
                          <div className="w-9 h-9 rounded-lg border border-border overflow-hidden bg-background flex items-center justify-center shrink-0">
                            {cat.image ? (
                              <img src={cat.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[11px] font-bold text-primary">{getInitials(cat.name)}</span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[180px]">
                            <p className="font-semibold text-text truncate">{cat.name}</p>
                            {cat.description && <p className="text-[11px] text-text-muted truncate">{cat.description}</p>}
                          </div>
                        </div>
                      </td>
                      {/* Parent */}
                      <td className="px-5 py-3 text-text-soft">
                        {cat.parent ? (
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-text-muted">subdirectory_arrow_right</span>
                            {cat.parent.name}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-1 bg-primary/10 text-primary-hover rounded uppercase tracking-wider">Main</span>
                        )}
                      </td>
                      {/* Products */}
                      <td className="px-5 py-3 text-center">
                        <span className={`font-bold ${cat.productCount === 0 ? 'text-text-muted' : 'text-text'}`}>{cat.productCount}</span>
                      </td>
                      {/* Sellers */}
                      <td className="px-5 py-3 text-center">
                        <span className="font-bold text-text">{cat.sellerCount}</span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3"><StatusBadge status={cat.status} /></td>
                      {/* Created */}
                      <td className="px-5 py-3 text-text-muted">{formatDate(cat.createdAt)}</td>
                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="relative group inline-block text-left">
                          <button className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-border transition-colors">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-soft-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                            <button onClick={() => setDetailId(cat._id)} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                            </button>
                            <button onClick={() => setFormModal({ open: true, editData: cat })} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                            </button>
                            {!cat.parent && (
                              <button onClick={() => setFormModal({ open: true, editData: { parent: { _id: cat._id, name: cat.name } } })} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">account_tree</span> Add Subcategory
                              </button>
                            )}
                            <div className="border-t border-border" />
                            <button onClick={() => openStatusModal(cat)} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">{cat.status === 'active' ? 'pause' : 'play_arrow'}</span>
                              {cat.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="border-t border-border" />
                            <button onClick={() => openDeleteModal(cat)} className="w-full text-left px-4 py-2.5 text-[13px] text-danger-content hover:bg-danger-bg flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">delete</span> Delete
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
            {total > limit && (
              <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
                <span className="text-[13px] text-text-muted">
                  Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total} categories
                </span>
                <div className="flex items-center gap-2">
                  <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="px-2 py-1.5 mr-2 text-[12px] border border-border rounded-md bg-surface text-text">
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded border border-border disabled:opacity-50 hover:bg-surface-sunken">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total} className="p-1.5 rounded border border-border disabled:opacity-50 hover:bg-surface-sunken">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, editData: null })}
        onSave={() => { fetchCategories(true); showToast(formModal.editData?._id ? 'Category updated.' : 'Category created.'); }}
        editData={formModal.editData}
        allCategories={allCategories}
      />

      {/* Detail Drawer */}
      <CategoryDetailDrawer
        categoryId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={cat => { setDetailId(null); setFormModal({ open: true, editData: cat }); }}
      />

      {/* Confirm Modal (status / delete) */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        loading={confirmModal.loading}
        onClose={() => setConfirmModal({ open: false })}
        onConfirm={handleConfirm}
      />

      {/* Move Products Modal */}
      {moveModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setMoveModal({ open: false, category: null })} />
          <div className="relative bg-surface rounded-2xl shadow-soft-lg w-full max-w-md p-6 z-10 border border-border">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-brand-500 text-[28px]">move_down</span>
              <div>
                <h3 className="font-display font-bold text-[18px] text-text">Move Products First</h3>
                <p className="text-text-muted text-[13px] mt-1">
                  <strong>"{moveModal.category?.name}"</strong> has products. Move them to another category before deleting.
                </p>
              </div>
            </div>
            <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-1.5">Move To Category</label>
            <select
              value={moveTarget}
              onChange={e => setMoveTarget(e.target.value)}
              className="w-full px-4 py-2.5 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text mb-4"
            >
              <option value="">Select a category...</option>
              {moveTargetOptions.map(c => (
                <option key={c._id} value={c._id}>{c.parent ? `  ↳ ${c.name}` : c.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setMoveModal({ open: false, category: null }); setMoveTarget(''); }} className="px-4 py-2 text-[13px] font-semibold border border-border rounded-lg hover:bg-surface-sunken">Cancel</button>
              <button onClick={handleMoveProducts} className="px-4 py-2 text-[13px] font-bold text-white bg-primary rounded-lg hover:bg-primary-hover">Move & Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg text-[13.5px] font-semibold transition-all duration-200 pointer-events-none z-50 flex items-center gap-2 ${
        toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${toast.type === 'error' ? 'bg-danger text-white' : 'bg-ink text-white'}`}>
        <span className="material-symbols-outlined text-[18px]">{toast.type === 'error' ? 'cancel' : 'check_circle'}</span>
        {toast.msg}
      </div>
    </>
  );
}
