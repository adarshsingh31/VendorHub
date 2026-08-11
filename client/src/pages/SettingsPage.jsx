import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/axiosInstance'
import { useAuth } from '../context/AuthContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcStrength(val) {
  let s = 0
  if (val.length > 5) s++
  if (val.length > 8) s++
  if (/[A-Z]/.test(val)) s++
  if (/[0-9]/.test(val)) s++
  if (/[^A-Za-z0-9]/.test(val)) s++
  return Math.min(s, 4)
}
const strengthColors     = ['', 'bg-[#ba1a1a]', 'bg-[#ffb95f]', 'bg-[#34A853]', 'bg-[#004ac6]']
const strengthLabels     = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthTextColors = ['', 'text-[#ba1a1a]', 'text-[#ffb95f]', 'text-[#34A853]', 'text-[#004ac6]']

const PROVIDER_BADGE = {
  local:  { label: 'Email & Password', icon: 'email',        color: 'bg-[#eff4ff] text-[#004ac6]'  },
  google: { label: 'Google',           icon: 'g_mobiledata', color: 'bg-green-50 text-green-700'   },
  both:   { label: 'Google + Email',   icon: 'link',         color: 'bg-purple-50 text-purple-700' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-[#f8f9ff]">
        <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px] text-[#004ac6]"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        <h2 className="font-bold text-[#0b1c30] text-base">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function SuccessBanner({ message }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium fade-in">
      <span className="material-symbols-outlined text-[18px] shrink-0"
        style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>
      {message}
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-[#ba1a1a] font-medium fade-in">
      <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
      {message}
    </div>
  )
}

function PasswordInput({ id, label, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-[#434655]">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete || 'current-password'}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="appearance-none block w-full px-4 py-3 pr-11 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737686] hover:text-[#004ac6] transition-colors"
        >
          <span className="material-symbols-outlined text-xl">{show ? 'visibility_off' : 'visibility'}</span>
        </button>
      </div>
    </div>
  )
}

function StrengthMeter({ password }) {
  if (!password) return null
  const s = calcStrength(password)
  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex gap-1 h-1 w-full">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${
            i <= Math.max(1, s) ? strengthColors[s] : 'bg-[#dce9ff]'
          }`} />
        ))}
      </div>
      <p className={`text-xs ${strengthTextColors[s]}`}>{strengthLabels[s] || 'Weak'}</p>
    </div>
  )
}

// ─── Set Password Section (Google-only users) ─────────────────────────────────
function SetPasswordForm({ onSuccess }) {
  const [password, setPassword]               = useState('')
  const [confirm, setConfirm]                 = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const mismatch = confirm && password !== confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/set-password', { password, confirmPassword: confirm })
      if (!data.success) { setError(data.message || 'Something went wrong.'); return }
      onSuccess(data.hasPassword)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-col gap-1.5">
        <PasswordInput
          id="sp-new"
          label="New Password"
          value={password}
          onChange={e => { setPassword(e.target.value); if (error) setError('') }}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <StrengthMeter password={password} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="sp-confirm" className="text-sm font-semibold text-[#434655]">Confirm Password</label>
        <input
          id="sp-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={e => { setConfirm(e.target.value); if (error) setError('') }}
          placeholder="Re-enter your password"
          className={`appearance-none block w-full px-4 py-3 border rounded-xl bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 text-sm transition-all input-glow ${
            mismatch ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]' : 'border-[#c3c6d7] focus:ring-[#004ac6] focus:border-[#004ac6]'
          }`}
        />
        {mismatch && <p className="text-xs text-[#ba1a1a]">Passwords do not match.</p>}
      </div>

      <button
        id="save-password-btn"
        type="submit"
        disabled={loading || !!mismatch}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#004ac6] hover:bg-[#0039a0] transition-all duration-150 hover:scale-[1.01] hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {loading
          ? <><div className="loader" /> Saving…</>
          : <><span className="material-symbols-outlined text-[18px]">lock</span> Save Password</>
        }
      </button>
    </form>
  )
}

// ─── Password Set Success Card ─────────────────────────────────────────────────
function PasswordSetSuccess() {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center fade-in">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
        <span className="material-symbols-outlined text-[36px] text-green-600"
          style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>
      <div>
        <p className="font-bold text-[#0b1c30] text-lg">Password Added Successfully</p>
        <p className="text-sm text-[#434655] mt-1">You can now login using either:</p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
          <span className="material-symbols-outlined text-green-600 text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="text-sm font-semibold text-green-700">Google</span>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3 bg-[#eff4ff] border border-[#004ac6]/20 rounded-xl">
          <span className="material-symbols-outlined text-[#004ac6] text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="text-sm font-semibold text-[#004ac6]">Email &amp; Password</span>
        </div>
      </div>
    </div>
  )
}

// ─── Change Password Section (local / both users) ─────────────────────────────
function ChangePasswordForm() {
  const [current, setCurrent]   = useState('')
  const [newPass, setNewPass]   = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const mismatch = confirm && newPass !== confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (newPass.length < 8) { setError('New password must be at least 8 characters.'); return }
    if (newPass !== confirm) { setError('New passwords do not match.'); return }
    setLoading(true)
    try {
      const { data } = await api.put('/api/auth/change-password', {
        currentPassword: current, newPassword: newPass, confirmPassword: confirm,
      })
      if (!data.success) { setError(data.message || 'Something went wrong.'); return }
      setSuccess(data.message)
      setCurrent(''); setNewPass(''); setConfirm('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {success && <SuccessBanner message={success} />}
      {error   && <ErrorBanner message={error} />}

      <PasswordInput
        id="cp-current"
        label="Current Password"
        value={current}
        onChange={e => { setCurrent(e.target.value); if (error) setError(''); if (success) setSuccess('') }}
        placeholder="Your current password"
        autoComplete="current-password"
      />

      <div className="flex flex-col gap-1.5">
        <PasswordInput
          id="cp-new"
          label="New Password"
          value={newPass}
          onChange={e => { setNewPass(e.target.value); if (error) setError('') }}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <StrengthMeter password={newPass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cp-confirm" className="text-sm font-semibold text-[#434655]">Confirm New Password</label>
        <input
          id="cp-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={e => { setConfirm(e.target.value); if (error) setError('') }}
          placeholder="Re-enter new password"
          className={`appearance-none block w-full px-4 py-3 border rounded-xl bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 text-sm transition-all input-glow ${
            mismatch ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]' : 'border-[#c3c6d7] focus:ring-[#004ac6] focus:border-[#004ac6]'
          }`}
        />
        {mismatch && <p className="text-xs text-[#ba1a1a]">Passwords do not match.</p>}
      </div>

      <button
        id="change-password-btn"
        type="submit"
        disabled={loading || !!mismatch}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#004ac6] hover:bg-[#0039a0] transition-all duration-150 hover:scale-[1.01] hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {loading
          ? <><div className="loader" /> Updating…</>
          : <><span className="material-symbols-outlined text-[18px]">lock_reset</span> Update Password</>
        }
      </button>
    </form>
  )
}

// ─── Sidebar nav (shared shell) ────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: 'dashboard',      label: 'Dashboard', path: '/dashboard' },
  { icon: 'shopping_cart',  label: 'Orders'                        },
  { icon: 'inventory_2',    label: 'Products'                      },
  { icon: 'group',          label: 'Customers'                     },
  { icon: 'analytics',      label: 'Analytics'                     },
  { icon: 'manage_accounts',label: 'Settings',  path: '/settings', active: true },
]

// ─── Main SettingsPage ─────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate()

  // Read stored user profile (set by login / signup / googleAuth)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vh_user')) || {} }
    catch { return {} }
  })

  // Track whether the set-password flow has been completed this session
  const [passwordSet, setPasswordSet] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!localStorage.getItem('vh_token')) navigate('/login')
  }, [navigate])

  const authProvider = user.authProvider || 'local'
  const badge = PROVIDER_BADGE[authProvider] || PROVIDER_BADGE.local

  // Called by SetPasswordForm on success
  const handlePasswordSet = (hasPassword) => {
    setPasswordSet(true)
    const updated = { ...user, hasPassword: hasPassword, authProvider: 'both' }
    setUser(updated)
    localStorage.setItem('vh_user', JSON.stringify(updated))
  }

  // Derive if user has password
  const hasPassword = user.hasPassword === true || passwordSet

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
          {NAV_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left w-full transition-all duration-200 ${
                item.active
                  ? 'text-[#004ac6] bg-[#004ac6]/10 font-bold'
                  : 'text-[#434655] hover:text-[#0b1c30] hover:bg-[#dce9ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]"
                style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Top Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-[#c3c6d7]/30 shadow-sm md:pl-64">
        <div className="flex justify-between items-center h-16 px-6 max-w-[1280px] mx-auto w-full">
          <div className="md:hidden text-xl font-bold text-[#004ac6] flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span>VendorHub</span>
          </div>
          <div className="hidden md:block text-lg font-semibold text-[#0b1c30]">Account Settings</div>
          <button
            onClick={() => {
              const role = JSON.parse(localStorage.getItem('vh_user') || '{}')?.role
              const map = { buyer: '/buyer', seller: '/seller', admin: '/admin' }
              navigate(map[role] || '/buyer')
            }}
            className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-[#434655] hover:text-[#004ac6] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 ml-0 md:ml-64 pt-24 px-4 md:px-8 pb-12 overflow-y-auto w-full">
        <div className="max-w-[640px] mx-auto flex flex-col gap-8">

          {/* Page Header */}
          <div>
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#0b1c30] tracking-tight">Settings</h1>
            <p className="text-lg text-[#434655] mt-1">Manage your profile and account security.</p>
          </div>

          {/* ── Profile Information ── */}
          <SectionCard title="Profile Information" icon="account_circle">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'Profile'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#c3c6d7]/40 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#eff4ff] flex items-center justify-center shadow-sm border border-[#c3c6d7]/30">
                    <span className="material-symbols-outlined text-[32px] text-[#004ac6]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      account_circle
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <p className="font-bold text-[#0b1c30] text-lg leading-tight truncate">
                  {user.name || 'Unknown User'}
                </p>
                <p className="text-sm text-[#434655] truncate">{user.email || '—'}</p>
                {/* Auth provider badge */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${badge.color}`}>
                  <span className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    {badge.icon}
                  </span>
                  {badge.label}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* ── Password Settings ── */}
          <SectionCard title="Password Settings" icon="lock">

            {/* Case 1: Just set the password in this session */}
            {passwordSet ? (
              <PasswordSetSuccess />
            ) : 
            /* Case 2: Does not have a password yet */
            !hasPassword ? (
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3 p-4 bg-[#eff4ff] border border-[#004ac6]/20 rounded-xl">
                  <span className="material-symbols-outlined text-[#004ac6] text-[20px] mt-0.5 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <p className="text-sm text-[#0b1c30]">
                    You signed in with Google. Set a password to also log in using your email and password.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0b1c30] mb-4">Set Password</p>
                  <SetPasswordForm onSuccess={handlePasswordSet} />
                </div>
              </div>
            ) : 
            /* Case 3: Already has a password */
            (
              <div className="flex flex-col gap-4">
                <p className="text-sm font-bold text-[#0b1c30]">Change Password</p>
                <ChangePasswordForm />
              </div>
            )}

          </SectionCard>

        </div>
      </main>
    </div>
  )
}
