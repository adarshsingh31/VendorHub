import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminUserService } from '../../services/adminUserService';

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

function UserStatusBadge({ status }) {
  const isSuspended = status === 'suspended';
  const bgClass = isSuspended ? 'bg-danger-bg' : 'bg-[#E6F2E9]';
  const textClass = isSuspended ? 'text-danger-content' : 'text-[#1E7A3E]';
  const label = isSuspended ? 'Suspended' : 'Active';

  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${bgClass} ${textClass}`}>
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

function UserDetailPanel({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await adminUserService.getUserById(userId);
        setUser(data.user);
      } catch (err) {
        setError('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-surface border-l border-border w-full max-w-md h-full overflow-y-auto shadow-soft-lg z-10 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between z-20">
          <h3 className="font-display font-bold text-[17px] text-text">User Details</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-sunken transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-danger-content font-medium">{error}</div>
          ) : user ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/20 text-primary-hover font-bold text-lg flex items-center justify-center border border-primary/30">
                    {getInitials(user.name)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-text text-[16px]">{user.name}</h4>
                  <p className="text-text-muted text-[13px]">{user.email}</p>
                </div>
                <div className="ml-auto">
                  <UserStatusBadge status={user.status} />
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h5 className="font-bold text-[14px] text-text mb-2">Basic Information</h5>
                <DetailRow icon="call" label="Phone" value={user.phone || 'Not provided'} />
                <DetailRow icon="calendar_today" label="Registered" value={formatDate(user.createdAt)} />
                <DetailRow icon="vpn_key" label="Auth Provider" value={<span className="capitalize">{user.authProvider}</span>} />
              </div>

              {/* Shopping Stats */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h5 className="font-bold text-[14px] text-text mb-2">Shopping Summary</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-sunken p-3 rounded-lg border border-border">
                    <p className="text-[11px] font-bold text-text-muted uppercase mb-1">Total Spent</p>
                    <p className="text-[18px] font-display font-bold text-text">₹{user.shoppingStats?.totalSpent?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-surface-sunken p-3 rounded-lg border border-border">
                    <p className="text-[11px] font-bold text-text-muted uppercase mb-1">Total Orders</p>
                    <p className="text-[18px] font-display font-bold text-text">{user.shoppingStats?.totalOrders || 0}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-[13px]">
                  <span className="text-text-soft"><b className="text-text">{user.shoppingStats?.completedOrders || 0}</b> Completed</span>
                  <span className="text-text-soft"><b className="text-text">{user.shoppingStats?.pendingOrders || 0}</b> Pending</span>
                  <span className="text-danger-content"><b className="text-danger-content">{user.shoppingStats?.cancelledOrders || 0}</b> Cancelled</span>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h5 className="font-bold text-[14px] text-text mb-2">Recent Orders</h5>
                {user.recentOrders && user.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {user.recentOrders.map(order => (
                      <div key={order._id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-surface hover:bg-surface-sunken transition-colors">
                        <div>
                          <p className="text-[12px] font-mono font-medium text-text-soft">#{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-[11px] text-text-muted">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold text-text">₹{order.totalAmount.toLocaleString()}</p>
                          <span className="text-[10px] uppercase font-bold text-text-muted">{order.orderStatus.replace('_', ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted italic">No recent orders.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [dateRange, setDateRange] = useState('all');

  // Search input debounce ref
  const searchTimeout = useRef(null);

  // Detail panel state
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, action: null, user: null, loading: false
  });

  // Toast state
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  // ── Fetch Users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminUserService.getUsers({
        page, limit, search, status, sort, dateRange
      });
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      setError('Failed to load users. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, sort, dateRange]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(val);
      setPage(1); // Reset to first page on search
    }, 500);
  };

  // ── Actions ──────────────────────────────────────────────────────────────────

  const openStatusModal = (user) => {
    const isSuspending = user.status === 'active';
    setConfirmModal({
      isOpen: true,
      action: 'status',
      user,
      loading: false,
      title: isSuspending ? 'Suspend User?' : 'Activate User?',
      message: isSuspending 
        ? `Are you sure you want to suspend ${user.name}? They will no longer be able to place orders or access buyer features.`
        : `Are you sure you want to reactivate ${user.name}? They will regain full access to the platform.`,
      confirmText: isSuspending ? 'Suspend User' : 'Activate User',
      isDestructive: isSuspending
    });
  };

  const openDeleteModal = (user) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      user,
      loading: false,
      title: 'Delete User Permanently?',
      message: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone and will remove all their data.`,
      confirmText: 'Delete User',
      isDestructive: true
    });
  };

  const handleConfirmAction = async () => {
    const { action, user } = confirmModal;
    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
      if (action === 'status') {
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        await adminUserService.updateUserStatus(user._id, newStatus);
        setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
        showToast(`User ${newStatus} successfully.`);
      } else if (action === 'delete') {
        await adminUserService.deleteUser(user._id);
        setUsers(users.filter(u => u._id !== user._id));
        setTotalUsers(prev => prev - 1);
        showToast('User deleted successfully.');
      }
      setConfirmModal({ isOpen: false, action: null, user: null, loading: false });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Action failed. Please try again.', 'error');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pb-10 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[26px] font-semibold my-1 text-text flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">group</span>
              Users
            </h1>
            <p className="m-0 text-text-muted text-[13.5px]">
              Manage registered buyers and their account activity.
            </p>
            {!loading && !error && (
              <p className="mt-2 text-[12px] font-bold text-text-soft bg-surface-sunken inline-block px-2.5 py-1 rounded-md border border-border">
                {totalUsers.toLocaleString()} Total Users
              </p>
            )}
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4 shadow-soft">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 text-[13px] border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-text transition-colors"
            />
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            <select 
              value={sort} 
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="nameAsc">Name A-Z</option>
              <option value="nameDesc">Name Z-A</option>
            </select>

            <select 
              value={dateRange} 
              onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              className="px-3 py-2 text-[13px] border border-border rounded-lg bg-background text-text focus:outline-none focus:border-primary"
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
          <div className="bg-danger-bg border border-danger/20 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-danger-content text-4xl mb-2">error</span>
            <p className="text-danger-content font-medium mb-4">{error}</p>
            <button onClick={fetchUsers} className="px-4 py-2 bg-surface text-text-soft border border-border rounded-lg text-sm font-semibold hover:bg-surface-sunken">
              Try Again
            </button>
          </div>
        ) : loading && users.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-5 animate-pulse space-y-3">
             {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-border rounded-lg" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
              <span className="material-symbols-outlined text-3xl">person_off</span>
            </div>
            <h2 className="font-bold text-[18px] mb-1 text-text">No users found</h2>
            <p className="text-[14px] text-text-muted">Try changing your search or filter criteria.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-background border-b border-border text-text-muted uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-center">Orders</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary-hover font-bold text-[12px] flex items-center justify-center">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <span className="font-semibold text-text">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-text-soft">{user.email}</td>
                      <td className="px-6 py-3 text-text-soft">{user.phone || <span className="text-text-muted italic">Not provided</span>}</td>
                      <td className="px-6 py-3 text-text-soft">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-3 text-center">
                        <span className="bg-surface-sunken px-2.5 py-1 rounded-md font-bold text-text border border-border">
                          {user.totalOrders || 0}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <UserStatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="relative group inline-block text-left">
                          <button className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-border transition-colors">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-lg shadow-soft-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                            <button onClick={() => setSelectedUserId(user._id)} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                            </button>
                            <div className="border-t border-border"></div>
                            <button onClick={() => openStatusModal(user)} className="w-full text-left px-4 py-2.5 text-[13px] text-text hover:bg-background transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">
                                {user.status === 'active' ? 'block' : 'check_circle'}
                              </span> 
                              {user.status === 'active' ? 'Suspend User' : 'Activate User'}
                            </button>
                            <button onClick={() => openDeleteModal(user)} className="w-full text-left px-4 py-2.5 text-[13px] text-danger-content hover:bg-danger-bg transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">delete</span> Delete User
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
            {totalUsers > limit && (
              <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
                <span className="text-[13px] text-text-muted">
                  Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, totalUsers)} of {totalUsers} users
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
                    className="p-1.5 rounded border border-border bg-surface text-text-soft disabled:opacity-50 hover:bg-surface-sunken"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= totalUsers}
                    className="p-1.5 rounded border border-border bg-surface text-text-soft disabled:opacity-50 hover:bg-surface-sunken"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <UserDetailPanel userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      
      <ConfirmModal 
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
      />

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg text-[13.5px] font-semibold transition-all duration-200 pointer-events-none z-50 flex items-center gap-2 ${
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
