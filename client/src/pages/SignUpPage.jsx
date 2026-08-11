import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, User, ShoppingBag, Store, Info, Check } from 'lucide-react'
import axios from 'axios'
import AuthLayout from '../components/AuthLayout.jsx'
import VHInput from '../components/VHInput.jsx'
import VHPasswordInput from '../components/VHPasswordInput.jsx'
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator.jsx'
import VHButton from '../components/VHButton.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { useToast } from '../components/ToastProvider.jsx'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ROLE_DASHBOARD = { buyer: '/buyer', seller: '/seller', admin: '/admin' }

const roles = [
  {
    id: 'buyer',
    icon: ShoppingBag,
    title: 'Shop on VendorHub',
    subtitle: 'Buyer',
  },
  {
    id: 'seller',
    icon: Store,
    title: 'Sell on VendorHub',
    subtitle: 'Seller',
  },
]

function validate({ fullName, email, password, confirmPassword, agree }) {
  const errors = {}
  if (!fullName.trim()) errors.fullName = 'Full name is required.'
  if (!email) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
  if (!agree) errors.agree = 'You must agree to the Terms & Privacy Policy.'
  return errors
}

export default function SignUpPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
    role: 'buyer',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { toast } = useToast()
  const { login, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      const destination = ROLE_DASHBOARD[role] || '/buyer'
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleChange = (field) => (e) => {
    const value = field === 'agree' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const handleAuthSuccess = ({ token, user }) => {
    login({ token, user })
    const destination = ROLE_DASHBOARD[user?.role] || '/buyer'
    navigate(destination)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate(form)
    setErrors(validation)
    if (Object.keys(validation).length) return

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.')
      }

      toast({
        variant: 'success',
        title: 'Account created',
        description:
          form.role === 'seller'
            ? 'Your seller account is pending admin approval.'
            : 'Welcome to VendorHub!',
      })

      handleAuthSuccess(data)
    } catch (err) {
      toast({ variant: 'error', title: 'Sign up failed', description: err.message })
      setErrors({ form: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true)
    setErrors({})

    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/google`, {
        credential,
      })

      if (!data.success) {
        throw new Error(data.message || 'Google signup failed. Please try again.')
      }

      toast({ variant: 'success', title: 'Welcome to VendorHub!', description: 'Google authentication successful.' })
      handleAuthSuccess(data)
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Google signup failed. Please try again.'
      toast({ variant: 'error', title: 'Google signup failed', description: message })
      setErrors({ form: message })
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = (message) => {
    toast({ variant: 'error', title: 'Google signup failed', description: message })
    setErrors({ form: message })
    setGoogleLoading(false)
  }

  return (
    <AuthLayout
      heading="Join your local marketplace today"
      subheading="Create an account to start shopping local sellers or launch your own store."
    >
      <h2 className="font-display text-[1.75rem] font-extrabold tracking-tight text-ink-900">
        Create your VendorHub account
      </h2>
      <p className="mt-1.5 text-[15px] text-ink-500">Join your local marketplace today.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
        {errors.form && (
          <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-500">
            {errors.form}
          </div>
        )}

        {/* Role selection */}
        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">I want to...</p>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => {
              const active = form.role === role.id
              return (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => setForm((f) => ({ ...f, role: role.id }))}
                  className={`relative flex flex-col items-start gap-2.5 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                    active
                      ? 'border-brand-500 bg-brand-50 shadow-soft'
                      : 'border-border bg-white hover:border-brand-200'
                  }`}
                >
                  {active && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      active ? 'bg-brand-600 text-white' : 'bg-surface-sunken text-ink-500'
                    }`}
                  >
                    <role.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{role.title}</p>
                    <p className="text-xs text-ink-400">{role.subtitle}</p>
                  </div>
                </button>
              )
            })}
          </div>
          {form.role === 'seller' && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3.5 py-3">
              <Info size={15} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-ink-600">
                Seller accounts require admin approval before you can start selling.
              </p>
            </div>
          )}
        </div>

        <VHInput
          label="Full Name"
          icon={User}
          placeholder="Jordan Lee"
          value={form.fullName}
          onChange={handleChange('fullName')}
          error={errors.fullName}
          autoComplete="name"
        />

        <VHInput
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />

        <div>
          <VHPasswordInput
            label="Password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordStrengthIndicator password={form.password} />
        </div>

        <VHPasswordInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={handleChange('agree')}
            className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded border-border text-brand-600 focus:ring-brand-500/30"
          />
          <span className="text-sm text-ink-600">
            I agree to the{' '}
            <a href="#" className="font-medium text-brand-600 hover:text-brand-700">Terms</a> &amp;{' '}
            <a href="#" className="font-medium text-brand-600 hover:text-brand-700">Privacy Policy</a>
          </span>
        </label>
        {errors.agree && <p className="-mt-3 text-sm text-danger-500">{errors.agree}</p>}

        <VHButton type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
          Create Account
        </VHButton>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-ink-400">OR</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        loading={googleLoading}
      />

      <p className="mt-7 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  )
}
