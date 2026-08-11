import { forwardRef } from 'react'
import LoadingSpinner from './LoadingSpinner.jsx'

const variantClasses = {
  primary:
    'bg-brand-600 text-white shadow-brand hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300 disabled:shadow-none',
  secondary:
    'bg-white text-ink-900 border border-border hover:border-brand-300 hover:bg-brand-50/60 disabled:opacity-50',
  ghost:
    'bg-transparent text-ink-700 hover:bg-surface-sunken disabled:opacity-50',
  outlineLight:
    'bg-white/10 text-white border border-white/30 backdrop-blur hover:bg-white/20 disabled:opacity-50',
  local:
    'bg-local-500 text-white shadow-[0_12px_24px_-10px_rgba(15,163,111,0.5)] hover:bg-local-600 disabled:opacity-50',
  danger:
    'bg-danger-500 text-white hover:opacity-90 disabled:opacity-50',
}

const sizeClasses = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-[15px] gap-2',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size={16} className={variant === 'primary' || variant === 'local' || variant === 'danger' ? 'text-white' : 'text-ink-500'} />
          <span>Please wait…</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={17} strokeWidth={2.2} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={17} strokeWidth={2.2} />}
        </>
      )}
    </button>
  )
})

export default Button
