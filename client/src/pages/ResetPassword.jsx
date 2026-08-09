import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/auth/reset-password/${token}`, {
        password,
      });
      
      setSuccess(response.data.message || 'Password reset successfully');
      
      // Redirect to login after a few seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f9] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#e5e7eb]">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#0b1c30] tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-[#434655]">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-[#ba1a1a] fade-in">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-green-50 border border-green-200 rounded-lg text-sm text-[#006e1c] fade-in">
            <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
            {success}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="password">
              New Password
            </label>
            <input
              className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#004ac6] hover:bg-[#003da6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004ac6] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !!success}
            type="submit"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="font-semibold text-[#004ac6] hover:text-[#003da6] transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
