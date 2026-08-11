import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, MailCheck } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import VHInput from '../components/VHInput.jsx'
import VHButton from '../components/VHButton.jsx'
import { useToast } from '../components/ToastProvider.jsx'
import { authApi } from '../services/authApi.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return setError('Email is required.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.')
    setError('')

    setSubmitting(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      toast({ variant: 'error', title: 'Something went wrong', description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        heading="Forgot your password?"
        subheading="No worries. We'll help you get back into your account in a couple of minutes."
      >
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-local-50 text-local-600">
            <MailCheck size={28} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink-900">
            Check your inbox
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
            If an account exists with this email, we&apos;ve sent instructions to reset your password.
          </p>
          <Link to="/login" className="mt-8 block">
            <VHButton variant="primary" size="lg" fullWidth icon={ArrowLeft}>
              Back to Sign In
            </VHButton>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      heading="Forgot your password?"
      subheading="No worries. We'll help you get back into your account in a couple of minutes."
    >
      <h2 className="font-display text-[1.75rem] font-extrabold tracking-tight text-ink-900">
        Forgot your password?
      </h2>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-500">
        No worries. Enter your email and we&apos;ll send you a secure password reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <VHInput
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
          error={error}
          autoComplete="email"
        />

        <VHButton type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
          Send Reset Link
        </VHButton>
      </form>

      <Link
        to="/login"
        className="mt-7 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft size={15} /> Back to Sign In
      </Link>
    </AuthLayout>
  )
}
