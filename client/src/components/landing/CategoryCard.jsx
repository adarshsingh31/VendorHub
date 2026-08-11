export default function CategoryCard({ name, count, icon: Icon }) {
  return (
    <button className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-border bg-white p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft-lg">
      <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
        <Icon size={22} strokeWidth={2} />
      </span>
      <div className="relative">
        <p className="font-display text-[15px] font-semibold text-ink-900">{name}</p>
        <p className="mt-0.5 text-sm text-ink-400">{count}</p>
      </div>
    </button>
  )
}
