import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import GoogleSignInButton from '../components/GoogleSignInButton'

// Base URL for the Express backend — set in client/.env as VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function LoginPage() {
  const navigate = useNavigate()

  // ── Email / password form state ──────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [form, setForm]                 = useState({ email: '', password: '' })

  // ── Google-specific loading state (separate so the two buttons don't clash) ─
  const [googleLoading, setGoogleLoading] = useState(false)

  // ── Shared helper: persist auth data and redirect ────────────────────────
  const handleAuthSuccess = ({ token, user }) => {
    // Store the VendorHub JWT and user profile in localStorage
    localStorage.setItem('vh_token', token)
    localStorage.setItem('vh_user', JSON.stringify(user))
    // Send the user to their dashboard
    navigate('/dashboard')
  }

  // ── Email / password handlers ────────────────────────────────────────────
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.')
        return
      }

      handleAuthSuccess(data)
    } catch {
      setError('Cannot connect to server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth handler ─────────────────────────────────────────────────
  /**
   * Called by <GoogleSignInButton> when Google successfully returns a credential.
   *
   * Flow:
   *   1. User clicks "Continue with Google" → Google account picker opens.
   *   2. User selects account → Google returns a credential (ID token).
   *   3. We POST that credential to our backend for verification.
   *   4. Backend verifies it with Google, upserts the user, and returns a JWT.
   *   5. We store the JWT and redirect to the dashboard.
   */
  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true)
    setError('')

    try {
      // Send the Google ID token to POST /api/auth/google
      const { data } = await axios.post(`${API_BASE}/api/auth/google`, {
        credential,
      })

      if (!data.success) {
        setError(data.message || 'Google login failed. Please try again.')
        return
      }

      handleAuthSuccess(data)
    } catch (err) {
      // axios wraps HTTP errors in err.response
      const message = err.response?.data?.message
        || 'Google login failed. Please try again.'
      setError(message)
    } finally {
      setGoogleLoading(false)
    }
  }

  // Called if the Google popup is dismissed or an OAuth error occurs
  const handleGoogleError = (message) => {
    setError(message)
    setGoogleLoading(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col antialiased">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/70 backdrop-blur-xl shadow-sm border-b border-[#c3c6d7]/30 h-20 flex items-center px-4 md:px-8">
        <div className="max-w-[1280px] w-full mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill text-[#004ac6]">hub</span>
            <span className="text-2xl font-bold tracking-tight text-[#004ac6]">VendorHub</span>
          </Link>
        </div>
      </header>

      {/* ── Main Split Screen ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col md:flex-row mt-20">

        {/* Left: Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-[#eff4ff] relative overflow-hidden flex-col justify-center items-center p-12">
          <div className="absolute inset-0 z-0">
            <div
              className="bg-cover bg-center w-full h-full opacity-90 mix-blend-multiply"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzs-Tf660zWvTjRKWuvhF5orUXNQHPW8sH5efhhp0R6uL4dEO12A2nn1sEAhXeJvJqeqXmxLX0P-T-9KjOUNPLOM_gTeIoe9wkqOaK_xvFuF2Mh8V8XlxF1qKlB3pSce4xpJaOC_xG2voHmRwjiNby3UE8PzoRaOmy09nSUlQZdgZHJVoc4vhGuO5akB3WlVWV2YbnXZOgDwUvsbz-SN9dUNUYuihJ8qSGRfN_lJ3E207VVoGoXnutDDtslM8-NcblS6GZdm0terF7')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9ff]/40 to-[#2563eb]/20 backdrop-blur-[2px]" />
          </div>
          <div className="relative z-10 max-w-md text-center text-[#0b1c30]">
            <h2 className="text-[32px] md:text-[48px] font-bold mb-4 text-[#0b1c30]">Empowering Local Commerce</h2>
            <p className="text-lg text-[#434655]">Join thousands of vendors and shoppers building a stronger community ecosystem.</p>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-white">
          <div className="w-full max-w-[420px] bg-white md:rounded-xl md:shadow-[0_1px_3px_0_rgba(0,0,0,0.05),_0_1px_2px_-1px_rgba(0,0,0,0.05)] md:p-12 flex flex-col gap-6">

            {/* Heading */}
            <div className="text-center md:text-left mb-2">
              <h1 className="text-[32px] font-bold text-[#0b1c30] mb-1">Welcome Back 👋</h1>
              <p className="text-base text-[#434655]">Login to continue shopping from nearby vendors.</p>
            </div>

            {/* ── Error Banner ─────────────────────────────────────────────── */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#ba1a1a]">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                {error}
              </div>
            )}

            {/* ── Google Sign-In ────────────────────────────────────────────
              Placed ABOVE the divider / form so it's the primary CTA.
              GoogleSignInButton handles the popup + calls handleGoogleSuccess.
            ─────────────────────────────────────────────────────────────── */}
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              loading={googleLoading}
            />

            {/* ── Divider ───────────────────────────────────────────────────── */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-[#c3c6d7]/30" />
              <span className="flex-shrink-0 mx-4 text-xs text-[#737686] uppercase tracking-wider">or sign in with email</span>
              <div className="flex-grow border-t border-[#c3c6d7]/30" />
            </div>

            {/* ── Email / Password Form ────────────────────────────────────── */}
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#434655]" htmlFor="email">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#737686]">mail</span>
                  </div>
                  <input
                    className="w-full pl-10 pr-3 py-3 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-base focus:border-[#004ac6] focus:ring focus:ring-[#004ac6]/10 input-transition outline-none"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    required
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#434655]" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#737686]">lock</span>
                  </div>
                  <input
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-base focus:border-[#004ac6] focus:ring focus:ring-[#004ac6]/10 input-transition outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737686] hover:text-[#0b1c30] transition-colors focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between mt-1 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input className="w-4 h-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]/20 bg-white" type="checkbox" />
                  <span className="text-sm text-[#434655]">Remember Me</span>
                </label>
                <Link className="text-sm font-semibold text-[#004ac6] hover:text-[#003ea8] transition-colors" to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                className="w-full bg-gradient-to-r from-[#004ac6] to-[#0053db] text-white text-sm font-semibold py-3 rounded-lg shadow-sm border-b border-white/20 btn-primary flex justify-center items-center gap-2 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <><div className="loader" /> Signing in…</>
                ) : (
                  <><span>Login</span><span className="material-symbols-outlined">arrow_forward</span></>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-[#434655] mt-2">
              Don't have an account?{' '}
              <Link className="text-sm font-semibold text-[#004ac6] hover:underline" to="/signup">Create Account</Link>
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-white border-t border-[#c3c6d7]/20 py-6 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#5d5f5f]">© 2024 VendorHub Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-sm text-[#5d5f5f] hover:text-[#004ac6] transition-colors" href="#">Privacy</a>
            <a className="text-sm text-[#5d5f5f] hover:text-[#004ac6] transition-colors" href="#">Terms</a>
            <a className="text-sm text-[#5d5f5f] hover:text-[#004ac6] transition-colors" href="#">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
