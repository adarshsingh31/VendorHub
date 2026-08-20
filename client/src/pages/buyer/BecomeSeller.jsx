import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sellerApplicationService } from '../../services/sellerApplicationService';

// ─── Status card sub-components ───────────────────────────────────────────────

function StatusCard({ icon, iconBg, iconColor, title, children }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-soft max-w-lg mx-auto">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: iconBg }}
      >
        <span
          className="material-symbols-outlined text-4xl"
          style={{ color: iconColor }}
        >
          {icon}
        </span>
      </div>
      {children}
    </div>
  );
}

function PendingCard() {
  const navigate = useNavigate();
  return (
    <StatusCard
      icon="schedule"
      iconBg="rgba(242,169,59,0.12)"
      iconColor="#b9791c"
      title="Application Submitted"
    >
      <h2 className="text-2xl font-display font-bold text-text mb-2">
        Application Submitted
      </h2>
      <p className="text-text-soft mb-4">Your application is under review.</p>

      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary-hover px-4 py-2 rounded-full text-sm font-bold mb-5">
        <span className="material-symbols-outlined text-[18px]">schedule</span>
        Status: PENDING
      </div>

      <p className="text-sm text-text-muted mb-7">
        Our admin team will verify your information and notify you once a
        decision is made.
      </p>

      <button
        onClick={() => navigate('/buyer')}
        className="bg-primary text-primary-content font-bold px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-soft"
      >
        Back to Dashboard
      </button>
    </StatusCard>
  );
}

function ApprovedCard({ onGoToDashboard }) {
  return (
    <StatusCard
      icon="verified"
      iconBg="rgba(14,124,123,0.1)"
      iconColor="#0e7c7b"
      title="Application Approved"
    >
      <h2 className="text-2xl font-display font-bold text-text mb-2">
        Application Approved
      </h2>
      <p className="text-text-soft mb-4">
        Congratulations! Your seller application has been approved.
      </p>

      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-hover px-4 py-2 rounded-full text-sm font-bold mb-5">
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
        You are now a seller.
      </div>

      <p className="text-sm text-text-muted mb-7">
        Your seller dashboard is ready. You can now list products and manage your shop.
      </p>

      <button
        onClick={onGoToDashboard}
        className="bg-accent text-white font-bold px-6 py-2.5 rounded-lg hover:bg-accent-hover transition-colors shadow-soft"
      >
        <span className="flex items-center gap-2 justify-center">
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          Go to Seller Dashboard
        </span>
      </button>
    </StatusCard>
  );
}

function RejectedCard({ adminNote, onApplyAgain }) {
  return (
    <StatusCard
      icon="cancel"
      iconBg="rgba(228,87,46,0.1)"
      iconColor="#e4572e"
      title="Application Rejected"
    >
      <h2 className="text-2xl font-display font-bold text-text mb-2">
        Application Rejected
      </h2>
      <p className="text-text-soft mb-4">
        Unfortunately, your seller application was not approved.
      </p>

      {adminNote && (
        <div className="bg-danger-bg border border-danger/20 rounded-xl px-4 py-3 mb-5 text-left">
          <p className="text-xs font-bold text-danger-content uppercase tracking-wide mb-1">
            Reason from admin
          </p>
          <p className="text-sm text-text">{adminNote}</p>
        </div>
      )}

      <p className="text-sm text-text-muted mb-7">
        You may review the feedback above and submit a new application.
      </p>

      <button
        onClick={onApplyAgain}
        className="bg-primary text-primary-content font-bold px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-soft"
      >
        <span className="flex items-center gap-2 justify-center">
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          Apply Again
        </span>
      </button>
    </StatusCard>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-2 animate-pulse">
      <div className="h-8 w-48 bg-border rounded-lg mb-2" />
      <div className="h-4 w-80 bg-border rounded mb-6" />
      <div className="bg-surface border border-border rounded-2xl p-8 shadow-soft space-y-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-border rounded-lg" />
        ))}
        <div className="h-12 bg-primary/20 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Main BecomeSeller page ────────────────────────────────────────────────────

export default function BecomeSeller() {
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();

  // Application fetched from backend on mount
  const [application, setApplication] = useState(undefined); // undefined = loading
  const [fetchError, setFetchError] = useState('');

  // Form state
  const [form, setForm] = useState({
    shopName: '',
    shopDescription: '',
    phone: '',
    city: '',
    shopAddress: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Fetch existing application on mount ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await sellerApplicationService.getMyApplication();
        if (!cancelled) setApplication(res.application); // null means no application
      } catch {
        if (!cancelled) setFetchError('Failed to load your application status. Please refresh.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Form handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        shopName: form.shopName,
        shopDescription: form.shopDescription,
        phone: form.phone,
        city: form.city,
        shopAddress: form.shopAddress,
      };
      const res = await sellerApplicationService.submit(payload);
      setApplication(res.application);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Failed to submit application. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Approved action — sync role then navigate ─────────────────────────────────
  const handleGoToDashboard = () => {
    // The application record itself tells us the user is now a seller.
    // We refresh the stored user so ProtectedRoute redirects correctly.
    const stored = localStorage.getItem('vh_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        refreshUser({ ...parsed, role: 'seller' });
      } catch { /* ignore */ }
    }
    navigate('/seller');
  };

  // ── Apply Again — reset to form ───────────────────────────────────────────────
  const handleApplyAgain = () => {
    setApplication(null);
    setForm({ shopName: '', shopDescription: '', phone: '', city: '', shopAddress: '' });
    setSubmitError('');
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  // Still loading
  if (application === undefined) {
    return fetchError ? (
      <div className="max-w-2xl mx-auto py-2">
        <div className="bg-danger-bg border border-danger/20 rounded-xl px-5 py-4 text-danger-content text-sm font-semibold">
          {fetchError}
        </div>
      </div>
    ) : (
      <LoadingSkeleton />
    );
  }

  // Pending
  if (application?.status === 'pending') {
    return <div className="max-w-2xl mx-auto py-2"><PendingCard /></div>;
  }

  // Approved
  if (application?.status === 'approved') {
    return (
      <div className="max-w-2xl mx-auto py-2">
        <ApprovedCard onGoToDashboard={handleGoToDashboard} />
      </div>
    );
  }

  // Rejected
  if (application?.status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto py-2">
        <RejectedCard
          adminNote={application.adminNote}
          onApplyAgain={handleApplyAgain}
        />
      </div>
    );
  }

  // No application — show the form
  return (
    <div className="max-w-2xl mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-text">Become a Seller</h1>
        <p className="text-text-soft mt-1">
          Fill in the details below. Our admin team will review your application.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="shopName">
              Shop Name <span className="text-danger">*</span>
            </label>
            <input
              id="shopName"
              name="shopName"
              type="text"
              required
              value={form.shopName}
              onChange={handleChange}
              placeholder="e.g. Rahul Electronics"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="shopDescription">
              Shop Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="shopDescription"
              name="shopDescription"
              required
              rows={3}
              value={form.shopDescription}
              onChange={handleChange}
              placeholder="Briefly describe what you plan to sell..."
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none text-text"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="phone">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="city">
                City <span className="text-danger">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Lucknow"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="shopAddress">
              Shop Address <span className="text-danger">*</span>
            </label>
            <input
              id="shopAddress"
              name="shopAddress"
              type="text"
              required
              value={form.shopAddress}
              onChange={handleChange}
              placeholder="Full address"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-text"
            />
          </div>

          {submitError && (
            <p className="text-sm text-danger bg-danger-bg rounded-lg px-4 py-2.5 font-semibold">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-content font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-soft"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-content border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                Submit Application
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
