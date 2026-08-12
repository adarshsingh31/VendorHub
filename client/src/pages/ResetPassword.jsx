import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { KeyRound, CheckCircle2, XCircle } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import VHPasswordInput from '../components/VHPasswordInput.jsx'
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator.jsx'
import VHButton from '../components/VHButton.jsx'
import { authApi } from '../services/authApi.js'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('form') // 'form' | 'success' | 'expired'

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const validate = ({ password, confirmPassword }) => {
    const errors = {}
    if (!password) errors.password = 'New password is required.'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate(form)
    setErrors(validation)
    if (Object.keys(validation).length) return

    setSubmitting(true)
    try {
      await authApi.resetPassword(token, { password: form.password })
      setStatus('success')
    } catch (err) {
      setErrors({ form: err.message })
      setStatus('expired')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'success') {
    return (
      <AuthLayout heading="All set." subheading="Your new password is active. Sign in to pick up right where you left off.">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <CheckCircle2 size={28} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-text">
            Password Reset Successful
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
            Your password has been updated successfully.
          </p>
          <VHButton variant="primary" size="lg" fullWidth className="mt-8" onClick={() => navigate('/login')}>
            Continue to Login
          </VHButton>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'expired') {
    return (
      <AuthLayout heading="Link expired" subheading="Password reset links are only valid for a short time, for your security.">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-bg text-danger">
            <XCircle size={28} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-text">
            Reset Link Expired
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
            This password reset link is no longer valid. Please request a new one.
          </p>
          <Link to="/forgot-password" className="mt-8 block">
            <VHButton variant="primary" size="lg" fullWidth>
              Request New Link
            </VHButton>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      heading="Create a new password"
      subheading="Choose a strong password you haven't used before on VendorHub."
    >
      <h2 className="font-display text-[1.75rem] font-bold tracking-tight text-text">
        Create a new password
      </h2>
      <p className="mt-1.5 text-[15px] text-text-muted">Your new password must be different from previous ones.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        {errors.form && (
          <div className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger-content">
            {errors.form}
          </div>
        )}

        <div>
          <VHPasswordInput
            label="New Password"
            placeholder="Enter a new password"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            showIcon={false}
            autoComplete="new-password"
          />
          <PasswordStrengthIndicator password={form.password} />
        </div>

        <VHPasswordInput
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          showIcon={false}
          autoComplete="new-password"
        />

        <VHButton type="submit" variant="primary" size="lg" fullWidth loading={submitting} icon={KeyRound}>
          Reset Password
        </VHButton>
      </form>
    </AuthLayout>
  )
}
