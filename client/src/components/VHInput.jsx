import { forwardRef, useId } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const VHInput = forwardRef(function VHInput(
  { label, error, success, hint, icon: Icon, className = '', id, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id || autoId

  const stateRing = error
    ? 'border-danger-500/60 focus:border-danger-500 focus:ring-danger-500/15'
    : success
    ? 'border-local-500/60 focus:border-local-500 focus:ring-local-500/15'
    : 'border-border focus:border-brand-500 focus:ring-brand-500/15'

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-ink-900 placeholder:text-ink-400 outline-none transition-colors duration-150 focus:ring-4 ${stateRing} ${Icon ? 'pl-11' : ''} ${error || success ? 'pr-11' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <AlertCircle size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-danger-500" />
        )}
        {success && !error && (
          <CheckCircle2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-local-500" />
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default VHInput
