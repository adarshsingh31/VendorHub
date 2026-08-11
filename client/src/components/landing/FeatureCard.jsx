export default function FeatureCard({ icon: Icon, title, description, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600',
    local: 'bg-local-50 text-local-600',
    ai: 'bg-ai-50 text-ai-600',
    amber: 'bg-amber-500/10 text-amber-500',
  }
  return (
    <div className="group rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accents[accent]}`}>
        <Icon size={20} strokeWidth={2} />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{description}</p>
    </div>
  )
}
