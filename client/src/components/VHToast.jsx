import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const variants = {
  success: {
    icon: CheckCircle2,
    ring: 'border-local-500/20',
    iconColor: 'text-local-600',
    iconBg: 'bg-local-50',
  },
  error: {
    icon: AlertCircle,
    ring: 'border-danger-500/20',
    iconColor: 'text-danger-500',
    iconBg: 'bg-danger-50',
  },
  default: {
    icon: Info,
    ring: 'border-brand-500/15',
    iconColor: 'text-brand-600',
    iconBg: 'bg-brand-50',
  },
}

export default function VHToast({ title, description, variant = 'default', onDismiss }) {
  const v = variants[variant] || variants.default
  const Icon = v.icon
  return (
    <div
      role="status"
      className={`animate-fade-up flex items-start gap-3 rounded-2xl border ${v.ring} bg-white/95 p-4 shadow-soft-lg backdrop-blur`}
    >
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${v.iconBg}`}>
        <Icon className={`h-4 w-4 ${v.iconColor}`} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold text-text">{title}</p>}
        {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-full p-1 text-text-muted transition-colors hover:bg-surface-sunken hover:text-text"
      >
        <X size={16} />
      </button>
    </div>
  )
}
