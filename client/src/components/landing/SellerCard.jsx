import { Star, MapPin, Truck, BadgeCheck } from 'lucide-react'

export default function SellerCard({ name, category, rating, distance, delivery, verified, initials, color }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg sm:p-5">
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} font-display text-base font-bold text-white`}
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-display text-[15px] font-semibold text-text">{name}</p>
          {verified && (
            <span className="flex items-center" title="Verified Seller">
              <BadgeCheck size={16} className="shrink-0 text-primary" />
            </span>
          )}
        </div>
        <p className="text-sm text-text-muted">{category}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-text-soft">
          <span className="flex items-center gap-1 text-amber-500">
            <Star size={13} fill="currentColor" strokeWidth={0} /> {rating}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {distance}
          </span>
          <span className="flex items-center gap-1 text-accent">
            <Truck size={13} /> {delivery}
          </span>
        </div>
      </div>
    </div>
  )
}
