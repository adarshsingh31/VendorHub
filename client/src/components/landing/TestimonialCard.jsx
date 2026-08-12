import { Star } from 'lucide-react'

export default function TestimonialCard({ name, location, rating, review }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <div className="flex gap-0.5 text-primary">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={15} fill={i < rating ? 'currentColor' : 'none'} strokeWidth={i < rating ? 0 : 1.5} className={i >= rating ? 'text-border' : ''} />
        ))}
      </div>
      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-text-soft">&ldquo;{review}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-semibold text-primary-hover">
          {initials}
        </span>
        <div>
          <p className="text-sm font-semibold text-text">{name}</p>
          <p className="text-xs text-text-muted">{location}</p>
        </div>
      </div>
    </div>
  )
}
