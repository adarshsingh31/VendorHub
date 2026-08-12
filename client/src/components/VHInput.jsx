import { forwardRef, useId } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const VHInput = forwardRef(function VHInput(
  { label, error, success, hint, icon: Icon, className = '', id, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id || autoId

  const stateRing = error
    ? 'border-danger/60 focus:border-danger focus:ring-danger/15'
    : success
    ? 'border-accent/60 focus:border-accent focus:ring-accent/15'
    : 'border-border focus:border-primary focus:ring-primary/15'

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-semibold text-text">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-11 w-full rounded-lg border bg-surface px-4 text-[13.5px] text-text placeholder:text-text-muted outline-none transition-colors duration-150 focus:ring-4 ${stateRing} ${Icon ? 'pl-10' : ''} ${error || success ? 'pr-10' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <AlertCircle size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-danger" />
        )}
        {success && !error && (
          <CheckCircle2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-accent" />
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs font-semibold text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default VHInput
