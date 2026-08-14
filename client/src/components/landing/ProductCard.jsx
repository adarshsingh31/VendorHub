export default function ProductCard({ name, price, seller, gradient = 'from-brand-100 to-brand-200', className = '' }) {
  return (
    <div className={`w-40 rounded-2xl border border-border bg-surface p-3 shadow-soft-lg ${className}`}>
      <div className={`h-20 w-full rounded-xl bg-gradient-to-br ${gradient}`} />
      <p className="mt-2.5 truncate text-[13px] font-semibold text-text">{name}</p>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <p className="text-[13px] font-bold text-primary">{price}</p>
        <p className="truncate text-[11px] text-text-muted">{seller}</p>
      </div>
    </div>
  )
}
