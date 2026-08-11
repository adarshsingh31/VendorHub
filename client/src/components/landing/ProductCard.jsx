export default function ProductCard({ name, price, seller, gradient = 'from-brand-100 to-brand-200', className = '' }) {
  return (
    <div className={`w-40 rounded-2xl border border-border bg-white p-3 shadow-soft-lg ${className}`}>
      <div className={`h-20 w-full rounded-xl bg-gradient-to-br ${gradient}`} />
      <p className="mt-2.5 truncate text-[13px] font-semibold text-ink-900">{name}</p>
      <div className="mt-0.5 flex items-center justify-between">
        <p className="text-[13px] font-bold text-brand-600">{price}</p>
        <p className="truncate text-[11px] text-ink-400">{seller}</p>
      </div>
    </div>
  )
}
