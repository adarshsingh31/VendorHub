export default function CategoryCard({ name, count, icon: Icon }) {
  return (
    <button className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft-lg">
      <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-content">
        <Icon size={22} strokeWidth={2} />
      </span>
      <div className="relative">
        <p className="font-display text-[15px] font-semibold text-text">{name}</p>
        <p className="mt-0.5 text-sm text-text-muted">{count}</p>
      </div>
    </button>
  )
}
