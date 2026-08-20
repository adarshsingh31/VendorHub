import React, { useState, useEffect, useCallback } from 'react';
import { sellerApplicationService } from '../../services/sellerApplicationService';

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

// ─── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  pending:  { bg: 'bg-[#FDF0DA]', text: 'text-[#B9791C]', label: 'Pending' },
  approved: { bg: 'bg-[#E6F2E9]', text: 'text-[#1E7A3E]', label: 'Approved' },
  rejected: { bg: 'bg-danger-bg',  text: 'text-danger-content', label: 'Rejected' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ─── Rejection Modal ──────────────────────────────────────────────────────────

function RejectModal({ application, onClose, onConfirm, loading }) {
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Card */}
      <div className="relative bg-surface rounded-2xl shadow-soft-lg w-full max-w-md p-6 z-10 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-danger-bg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-danger-content text-[20px]">cancel</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-[17px] text-text">Reject Application</h3>
            <p className="text-text-muted text-[12.5px]">
              {application?.user?.name} — {application?.shopName}
            </p>
          </div>
        </div>

        <label className="block text-sm font-semibold text-text mb-1.5">
          Rejection Reason <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Incomplete information, duplicate listing, …"
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none text-text mb-4"
        />

        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-surface-sunken transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={loading}
            className="bg-danger text-white font-bold text-[13px] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rejecting…
              </>
            ) : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel (slide-in from right) ──────────────────────────────────────

function DetailPanel({ application, onClose, onApprove, onReject, approving, rejecting }) {
  if (!application) return null;
  const isPending = application.status === 'pending';

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-surface border-l border-border w-full max-w-md h-full overflow-y-auto shadow-soft-lg z-10 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-[17px] text-text">Application Details</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-sunken transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 space-y-5">
          {/* Applicant */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-11 h-11 rounded-full bg-[#FBEFDA] text-[#B9791C] font-bold text-sm flex items-center justify-center shrink-0">
              {getInitials(application.user?.name)}
            </div>
            <div>
              <p className="font-semibold text-text text-[14px]">{application.user?.name}</p>
              <p className="text-text-muted text-[12.5px]">{application.user?.email}</p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={application.status} />
            </div>
          </div>

          {/* Shop Info */}
          <DetailRow icon="store" label="Shop Name" value={application.shopName} />
          <DetailRow icon="description" label="Description" value={application.shopDescription} />
          <DetailRow icon="call" label="Phone" value={application.phone} />
          <DetailRow icon="location_city" label="City" value={application.city} />
          <DetailRow icon="home_pin" label="Address" value={application.shopAddress} />
          <DetailRow icon="calendar_today" label="Applied" value={formatDate(application.createdAt)} />

          {application.reviewedAt && (
            <DetailRow icon="event_available" label="Reviewed" value={formatDate(application.reviewedAt)} />
          )}

          {application.adminNote && (
            <div className="bg-danger-bg border border-danger/20 rounded-xl p-4">
              <p className="text-xs font-bold text-danger-content uppercase tracking-wide mb-1">Admin note</p>
              <p className="text-sm text-text">{application.adminNote}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isPending && (
          <div className="sticky bottom-0 bg-surface border-t border-border px-5 py-4 flex gap-2.5">
            <button
              onClick={() => onReject(application)}
              disabled={approving || rejecting}
              className="flex-1 border border-[#F3C7B8] text-danger-content bg-white rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-danger-bg transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              Reject
            </button>
            <button
              onClick={() => onApprove(application._id)}
              disabled={approving || rejecting}
              className="flex-1 border border-[#BFE0DE] text-accent-hover bg-white rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-accent/10 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {approving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Approving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Approve
                </>
              )}
            </button>
          </div>
        )}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SellerApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Detail panel
  const [selected, setSelected] = useState(null);

  // Actions
  const [approving, setApproving] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null); // application being rejected
  const [rejecting, setRejecting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  // ── Fetch applications ────────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await sellerApplicationService.getAllApplications();
      setApplications(res.applications || []);
    } catch {
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ── Approve ───────────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setApproving(true);
    try {
      await sellerApplicationService.approveApplication(id);
      setApplications((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, status: 'approved', reviewedAt: new Date().toISOString() } : a
        )
      );
      if (selected?._id === id) setSelected((s) => s ? { ...s, status: 'approved' } : s);
      showToast('Application approved — user is now a seller.', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to approve.', 'error');
    } finally {
      setApproving(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────────
  const handleRejectConfirm = async (adminNote) => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await sellerApplicationService.rejectApplication(rejectTarget._id, adminNote);
      setApplications((prev) =>
        prev.map((a) =>
          a._id === rejectTarget._id
            ? { ...a, status: 'rejected', adminNote, reviewedAt: new Date().toISOString() }
            : a
        )
      );
      if (selected?._id === rejectTarget._id)
        setSelected((s) => s ? { ...s, status: 'rejected', adminNote } : s);
      showToast('Application rejected.', 'error');
      setRejectTarget(null);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to reject.', 'error');
    } finally {
      setRejecting(false);
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filtered = filterStatus === 'all'
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pb-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-text-muted font-semibold">
              Admin Console
            </p>
            <h1 className="font-display text-[26px] font-semibold my-1 text-text">
              Seller Applications
            </h1>
            <p className="m-0 text-text-muted text-[13.5px]">
              Review and manage seller onboarding requests.
            </p>
          </div>
          <button
            onClick={fetchApplications}
            className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2.5 rounded-lg hover:bg-surface-sunken transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">refresh</span>
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold border transition-colors capitalize ${
                filterStatus === tab
                  ? 'bg-ink text-white border-ink'
                  : 'bg-surface border-border text-text-soft hover:bg-surface-sunken'
              }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 opacity-70">{counts[tab]}</span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger-bg border border-danger/20 rounded-xl px-5 py-3.5 text-danger-content text-sm font-semibold mb-5">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-surface border border-border rounded-xl p-5 animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-border rounded-lg" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
              <span className="material-symbols-outlined text-3xl">assignment</span>
            </div>
            <p className="font-semibold text-text mb-1">No applications</p>
            <p className="text-text-muted text-sm">
              {filterStatus === 'all'
                ? 'No seller applications have been submitted yet.'
                : `No ${filterStatus} applications at the moment.`}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    {['Applicant', 'Shop Name', 'Phone', 'City', 'Applied', 'Status', ''].map((h) => (
                      <th
                        key={h}
                        className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider px-5 py-3.5"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => (
                    <tr
                      key={app._id}
                      className="border-b border-border last:border-0 hover:bg-surface-sunken/50 transition-colors"
                    >
                      {/* Applicant */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#FBEFDA] text-[#B9791C] font-bold text-[11.5px] flex items-center justify-center shrink-0">
                            {getInitials(app.user?.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-text text-[12.5px]">{app.user?.name || '—'}</p>
                            <p className="text-text-muted text-[11px]">{app.user?.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      {/* Shop Name */}
                      <td className="px-5 py-3.5 text-text font-medium">{app.shopName}</td>
                      {/* Phone */}
                      <td className="px-5 py-3.5 text-text-muted">{app.phone}</td>
                      {/* City */}
                      <td className="px-5 py-3.5 text-text-muted">{app.city}</td>
                      {/* Date */}
                      <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">
                        {formatDate(app.createdAt)}
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setRejectTarget(app)}
                                disabled={approving || rejecting}
                                className="border border-[#F3C7B8] text-danger-content bg-white rounded-md px-2.5 py-1 text-[11.5px] font-semibold hover:bg-danger/10 transition-colors disabled:opacity-60"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleApprove(app._id)}
                                disabled={approving || rejecting}
                                className="border border-[#BFE0DE] text-accent-hover bg-white rounded-md px-2.5 py-1 text-[11.5px] font-semibold hover:bg-accent/10 transition-colors disabled:opacity-60"
                              >
                                {approving ? '…' : 'Approve'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelected(app)}
                            className="border border-border text-text-soft bg-white rounded-md px-2.5 py-1 text-[11.5px] font-semibold hover:bg-surface-sunken transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <DetailPanel
          application={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={(app) => setRejectTarget(app)}
          approving={approving}
          rejecting={rejecting}
        />
      )}

      {/* Rejection Modal */}
      {rejectTarget && (
        <RejectModal
          application={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
          loading={rejecting}
        />
      )}

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg text-[13.5px] font-semibold transition-all duration-200 pointer-events-none z-50 flex items-center gap-2 ${
          toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        } ${toast.type === 'error' ? 'bg-danger text-white' : 'bg-ink text-white'}`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {toast.type === 'error' ? 'cancel' : 'check_circle'}
        </span>
        {toast.msg}
      </div>
    </>
  );
}
