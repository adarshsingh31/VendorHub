import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/axiosInstance'


// ─── Password strength calculator (mirrors SignUpPage) ────────────────────────
function calcStrength(val) {
  let s = 0
  if (val.length > 5) s++
  if (val.length > 8) s++
  if (/[A-Z]/.test(val)) s++
  if (/[0-9]/.test(val)) s++
  if (/[^A-Za-z0-9]/.test(val)) s++
  return Math.min(s, 4)
}

const strengthColors = ['', 'bg-[#ba1a1a]', 'bg-[#ffb95f]', 'bg-[#34A853]', 'bg-[#004ac6]']
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthTextColors = ['', 'text-[#ba1a1a]', 'text-[#ffb95f]', 'text-[#34A853]', 'text-[#004ac6]']

// ─── Sidebar nav items (matching Dashboard / Notes style) ─────────────────────
const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'sticky_note_2', label: 'Notes', path: '/notes' },
  { icon: 'lock_reset', label: 'Set Password', path: '/set-password', active: true },
]

export default function SetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const passwordMismatch = confirmPassword && password !== confirmPassword

  const handlePasswordChange = (e) => {
    const val = e.target.value
    setPassword(val)
    setStrength(calcStrength(val))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Client-side guards
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post(
        '/api/auth/set-password',
        { password, confirmPassword }
      )

      if (!data.success) {
        setError(data.message || 'Something went wrong. Please try again.')
        return
      }

      setSuccess(data.message)
      setPassword('')
      setConfirmPassword('')
      setStrength(0)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to set password. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full min-h-screen bg-[#f8f9ff] font-[Inter,sans-serif] text-[#0b1c30] antialiased flex overflow-hidden">

      {/* ── Sidebar ── */}
      <nav className="h-screen w-64 fixed left-0 top-0 pt-16 bg-white border-r border-[#c3c6d7]/20 flex flex-col gap-2 p-6 z-40 hidden md:flex shadow-[1px_0_0_0_rgba(0,0,0,0.04)]">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="material-symbols-outlined text-[#004ac6] text-3xl">hub</span>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#004ac6] leading-tight">VendorHub</span>
            <span className="text-xs text-[#434655] font-medium tracking-wide">Premium Merchant</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left w-full transition-all duration-200 ${
                item.active
                  ? 'text-[#004ac6] bg-[#004ac6]/10 font-bold'
                  : 'text-[#434655] hover:text-[#0b1c30] hover:bg-[#dce9ff]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Top Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-[#c3c6d7]/30 shadow-sm md:pl-64 transition-all duration-150">
        <div className="flex justify-between items-center h-16 px-6 max-w-[1280px] mx-auto w-full">
          {/* Mobile Brand */}
          <div className="md:hidden text-xl font-bold text-[#004ac6] flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span>VendorHub</span>
          </div>
          <div className="hidden md:block text-lg font-semibold text-[#0b1c30]">
            Account Settings
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-[#434655] hover:text-[#004ac6] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 ml-0 md:ml-64 pt-24 px-4 md:px-8 pb-12 overflow-y-auto w-full">
        <div className="max-w-[560px] mx-auto flex flex-col gap-8">

          {/* Page Header */}
          <div>
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#0b1c30] tracking-tight">
              Set Password
            </h1>
            <p className="text-lg text-[#434655] mt-1">
              Add or update a password so you can sign in with email and password.
            </p>
          </div>

          {/* Info card for Google users */}
          <div className="flex items-start gap-3 p-4 bg-[#eff4ff] border border-[#004ac6]/20 rounded-xl">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px] mt-0.5 shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              info
            </span>
            <p className="text-sm text-[#0b1c30]">
              If you signed up with Google, setting a password lets you log in using{' '}
              <strong>either</strong> Google <em>or</em> your email and password — both will work.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 md:p-8 flex flex-col gap-6">

            {/* Success banner */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium fade-in">
                <span className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                {success}
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-[#ba1a1a] font-medium fade-in">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {error}
              </div>
            )}

            <form id="setPasswordForm" onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sp-password" className="text-sm font-semibold text-[#434655]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="sp-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="At least 8 characters"
                    className="appearance-none block w-full px-4 py-3 pr-11 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737686] hover:text-[#004ac6] transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <>
                    <div className="flex gap-1 h-1 w-full mt-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors duration-300 ${
                            i <= Math.max(1, strength) ? strengthColors[strength] : 'bg-[#dce9ff]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs mt-0.5 ${strengthTextColors[strength]}`}>
                      {strengthLabels[strength] || 'Weak'}
                    </p>
                  </>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sp-confirm" className="text-sm font-semibold text-[#434655]">
                  Confirm Password
                </label>
                <input
                  id="sp-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Re-enter your password"
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 text-sm transition-all duration-150 input-glow ${
                    passwordMismatch
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a] focus:border-[#ba1a1a]'
                      : 'border-[#c3c6d7] focus:ring-[#004ac6] focus:border-[#004ac6]'
                  }`}
                />
                {passwordMismatch && (
                  <p className="text-xs text-[#ba1a1a] mt-0.5">Passwords do not match.</p>
                )}
              </div>

              {/* Submit */}
              <button
                id="set-password-submit"
                type="submit"
                disabled={loading || !!passwordMismatch}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#004ac6] hover:bg-[#0039a0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004ac6] transition-all duration-150 hover:scale-[1.01] hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><div className="loader" /> Saving…</>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Set Password
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  )
}
