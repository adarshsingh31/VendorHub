import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BecomeSeller() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shopName: '',
    description: '',
    phone: '',
    city: '',
    address: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // TODO: Replace with real API call: await api.post('/api/seller/apply', form)
      await new Promise((r) => setTimeout(r, 1000)); // mock delay
      setSubmitted(true);
    } catch {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-2">
      {submitted ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-soft">
          <div className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-text mb-2">Application Submitted!</h2>
          <p className="text-text-soft mb-2">Your seller application is under review.</p>
          <p className="text-sm text-text-muted mb-6">Our admin team will review your application and notify you via email. This usually takes 1–3 business days.</p>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary-hover px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            Status: Pending Review
          </div>
          <br />
          <button
            onClick={() => navigate('/buyer')}
            className="bg-primary text-primary-content font-bold px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-soft"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-text">Become a Seller</h1>
            <p className="text-text-soft mt-1">Fill in the details below. Our admin team will review your application.</p>
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
                <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="description">
                  Shop Description <span className="text-danger">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  value={form.description}
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
                <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="address">
                  Shop Address <span className="text-danger">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Full address"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-text"
                />
              </div>

              {error && (
                <p className="text-sm text-danger bg-danger-bg rounded-lg px-4 py-2.5 font-semibold">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-content font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-soft"
              >
                {loading ? (
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
        </>
      )}
    </div>
  );
}
