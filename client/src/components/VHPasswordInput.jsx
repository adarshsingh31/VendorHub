import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff, AlertCircle, Lock } from 'lucide-react'

const VHPasswordInput = forwardRef(function VHPasswordInput(
  { label, error, hint, className = '', id, showIcon = true, ...props },
  ref
) {
  const [visible, setVisible] = useState(false)
  const autoId = useId()
  const inputId = id || autoId

  const stateRing = error
    ? 'border-danger/60 focus:border-danger focus:ring-danger/15'
    : 'border-border focus:border-primary focus:ring-primary/15'

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-semibold text-text">
          {label}
        </label>
      )}
      <div className="relative">
        {showIcon && (
          <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        )}
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`h-11 w-full rounded-lg border bg-surface pr-11 text-[13.5px] text-text placeholder:text-text-muted outline-none transition-colors duration-150 focus:ring-4 ${stateRing} ${showIcon ? 'pl-10' : 'pl-4'} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-danger">
          <AlertCircle size={14} /> {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default VHPasswordInput
