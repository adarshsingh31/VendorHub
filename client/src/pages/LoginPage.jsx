import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import axios from 'axios'
import AuthLayout from '../components/AuthLayout.jsx'
import VHInput from '../components/VHInput.jsx'
import VHPasswordInput from '../components/VHPasswordInput.jsx'
import VHButton from '../components/VHButton.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { useToast } from '../components/ToastProvider.jsx'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ROLE_DASHBOARD = { buyer: '/buyer', seller: '/seller', admin: '/admin' }

function validate({ email, password }) {
  const errors = {}
  if (!email) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  return errors
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
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
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const handleAuthSuccess = ({ token, user }) => {
    login({ token, user })
    toast({ variant: 'success', title: 'Welcome back!', description: 'You have signed in successfully.' })
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
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please try again.')
      }

      handleAuthSuccess(data)
    } catch (err) {
      toast({ variant: 'error', title: 'Sign in failed', description: err.message })
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
        throw new Error(data.message || 'Google login failed. Please try again.')
      }

      handleAuthSuccess(data)
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Google login failed. Please try again.'
      toast({ variant: 'error', title: 'Google sign in failed', description: message })
      setErrors({ form: message })
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = (message) => {
    toast({ variant: 'error', title: 'Google sign in failed', description: message })
    setErrors({ form: message })
    setGoogleLoading(false)
  }

  return (
    <AuthLayout
      heading="Welcome back to VendorHub"
      subheading="Shop smarter. Sell better. Grow locally."
    >
      <h2 className="font-display text-[1.75rem] font-bold tracking-tight text-text">
        Welcome Back
      </h2>
      <p className="mt-1.5 text-[15px] text-text-muted">Sign in to continue to VendorHub</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        {errors.form && (
          <div className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger-content">
            {errors.form}
          </div>
        )}

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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-accent hover:text-accent-hover">
              Forgot Password?
            </Link>
          </div>
        </div>

        <VHButton type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
          Sign In
        </VHButton>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-text-muted">OR</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        loading={googleLoading}
      />

      <p className="mt-7 text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-semibold text-primary hover:text-primary-hover">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  )
}
