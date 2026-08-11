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
    ? 'border-danger-500/60 focus:border-danger-500 focus:ring-danger-500/15'
    : 'border-border focus:border-brand-500 focus:ring-brand-500/15'

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {showIcon && (
          <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        )}
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`h-12 w-full rounded-xl border bg-white pr-11 text-[15px] text-ink-900 placeholder:text-ink-400 outline-none transition-colors duration-150 focus:ring-4 ${stateRing} ${showIcon ? 'pl-11' : 'pl-4'} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-700"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 flex items-center gap-1 text-sm text-danger-500">
          <AlertCircle size={14} /> {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default VHPasswordInput
