export default function FeatureCard({ icon: Icon, title, description, accent = 'primary' }) {
  const accents = {
    brand:   'bg-primary/10 text-primary',
    primary: 'bg-primary/10 text-primary',
    local:   'bg-accent/10 text-accent',
    ai:      'bg-accent/10 text-accent',
    amber:   'bg-primary/10 text-primary-hover',
  }
  return (
    <div className="group rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accents[accent] || accents.primary}`}>
        <Icon size={20} strokeWidth={2} />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-text">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{description}</p>
    </div>
  )
}
