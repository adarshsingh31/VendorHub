import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import GoogleSignInButton from '../components/GoogleSignInButton'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [strength, setStrength] = useState(0)
  const [strengthText, setStrengthText] = useState('Password strength')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  // ── Google-specific loading state ────────────────────────────────────────
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const calcStrength = (val) => {
    let s = 0
    if (val.length > 5) s++
    if (val.length > 8) s++
    if (/[A-Z]/.test(val)) s++
    if (/[0-9]/.test(val)) s++
    if (/[^A-Za-z0-9]/.test(val)) s++
    s = Math.min(s, 4)
    setStrength(s)
    if (!val) { setStrengthText('Password strength'); return }
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    setStrengthText(labels[s] || 'Weak')
  }

  const strengthColors = ['', 'bg-[#ba1a1a]', 'bg-[#ffb95f]', 'bg-[#34A853]', 'bg-[#004ac6]']
  const passwordMismatch = confirmPassword && password !== confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (passwordMismatch) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Signup failed. Please try again.')
        return
      }

      // Store token and user info
      localStorage.setItem('vh_token', data.token)
      localStorage.setItem('vh_user', JSON.stringify(data.user))

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError('Cannot connect to server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth handler ─────────────────────────────────────────────────
  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true)
    setError('')
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/google`, { credential })
      if (!data.success) {
        setError(data.message || 'Google sign-up failed. Please try again.')
        return
      }
      localStorage.setItem('vh_token', data.token)
      localStorage.setItem('vh_user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || 'Google sign-up failed. Please try again.'
      setError(message)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = (message) => {
    setError(message)
    setGoogleLoading(false)
  }

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] antialiased min-h-screen flex flex-col md:flex-row">
      {/* Left: Illustration */}
      <div className="hidden md:flex flex-col flex-1 bg-[#dce9ff] relative overflow-hidden justify-center items-center p-8">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#2563eb]/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#996100]/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10 max-w-lg text-center">
          <h1 className="text-5xl font-bold text-[#004ac6] tracking-tight mb-4">VendorHub</h1>
          <p className="text-lg text-[#434655] mb-12">Connecting local vendors with a vibrant community of buyers. Scale your business with powerful tools.</p>
          <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl shadow-[#2563eb]/20 border border-[#c3c6d7]/30">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPC6MOUf9JjgMCxUDr45x62FN9lW75ovBxyRQ0nB2a8Jjixkgr496asiP0aFT3OTcjEtNUTrKRzmKz_0anctn0lXDVENx7xi9Hgw4aKsoB0qrXv57O0QP2NWKCffzqqSK4n8PAO0y9txG80gSSbPUIQ6HOq_buf8Bcm9gJwaTvqyGNeItN91wjFNyOtI6AaCiBffKGIuolMKGLbJcNHEP1-djQ2y7icIuX_uuedIO5q1JdG7MfaKI8VNWwxJMveIiXOSbUcBHDgPrS"
              alt="VendorHub marketplace"
            />
          </div>
        </div>
      </div>

      {/* Right: Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] relative min-h-screen">
        {/* Mobile Brand */}
        <div className="md:hidden flex items-center justify-center mb-12">
          <span className="material-symbols-outlined text-[#004ac6] text-4xl mr-2 icon-fill">hub</span>
          <span className="text-[32px] font-bold tracking-tight text-[#004ac6]">VendorHub</span>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-2xl font-semibold text-[#0b1c30] mb-2">Create Your Account</h2>
            <p className="text-sm text-[#434655]">Join VendorHub and start shopping locally.</p>
          </div>

          <div className="mt-6">
            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-[#ba1a1a] fade-in">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                {error}
              </div>
            )}

            <form className="space-y-4" id="signupForm" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="name">Full Name</label>
                <input
                  autoComplete="name"
                  className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow"
                  id="name"
                  name="name"
                  required
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="email">Email address</label>
                <input
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow"
                  id="email"
                  name="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="phone">Phone Number</label>
                <input
                  autoComplete="tel"
                  className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow"
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="password">Password</label>
                <div className="mt-1 relative">
                  <input
                    autoComplete="new-password"
                    className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow pr-10"
                    id="password"
                    name="password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); calcStrength(e.target.value); if (error) setError('') }}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737686] hover:text-[#004ac6] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {/* Strength Meter */}
                <div className="mt-2 flex gap-1 h-1 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors duration-300 ${password.length > 0 && i <= Math.max(1, strength) ? strengthColors[strength] : 'bg-[#dce9ff]'}`}
                    />
                  ))}
                </div>
                <p className={`mt-1 text-xs ${strength <= 1 ? 'text-[#ba1a1a]' : strength === 2 ? 'text-[#ffb95f]' : 'text-[#004ac6]'}`}>
                  {strengthText}
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="confirm_password">Confirm Password</label>
                <div className="mt-1 relative">
                  <input
                    autoComplete="new-password"
                    className={`appearance-none block w-full px-3 py-3 border rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 text-sm transition-all duration-150 input-glow ${passwordMismatch ? 'border-[#ba1a1a] focus:ring-[#ba1a1a] focus:border-[#ba1a1a]' : 'border-[#c3c6d7] focus:ring-[#004ac6] focus:border-[#004ac6]'}`}
                    id="confirm_password"
                    name="confirm_password"
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError('') }}
                  />
                </div>
                {passwordMismatch && (
                  <p className="mt-1 text-xs text-[#ba1a1a]">Passwords do not match.</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-[#004ac6] focus:ring-[#004ac6] border-[#c3c6d7] rounded bg-white transition-colors cursor-pointer"
                  id="terms"
                  name="terms"
                  required
                  type="checkbox"
                />
                <label className="ml-2 block text-sm text-[#434655]" htmlFor="terms">
                  I agree to the{' '}
                  <a className="text-[#004ac6] hover:text-[#2563eb] font-medium transition-colors" href="#">Terms</a>
                  {' '}and{' '}
                  <a className="text-[#004ac6] hover:text-[#2563eb] font-medium transition-colors" href="#">Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <div>
                <button
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#004ac6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004ac6] transition-all duration-150 hover:scale-[1.02] hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading || !!passwordMismatch}
                >
                  {loading ? (
                    <><div className="loader" /> Creating account…</>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Social Sign Up */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#c3c6d7]/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-sm text-[#434655]">Or continue with</span>
                </div>
              </div>
              <div className="mt-4">
                <GoogleSignInButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  loading={googleLoading}
                />
              </div>
            </div>
          </div>

          <p className="mt-12 text-center text-sm text-[#434655]">
            Already have an account?{' '}
            <Link className="text-sm font-semibold text-[#004ac6] hover:text-[#2563eb] transition-colors" to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
