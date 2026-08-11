import { stats } from '../../data/landingData.js'

export default function StatsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-6 rounded-3xl border border-border bg-white p-8 shadow-soft sm:grid-cols-4 sm:p-10">
          {stats.map((s, i) => (
            <div key={s.label} className={`text-center ${i < stats.length - 1 ? 'sm:border-r sm:border-border' : ''}`}>
              <p className="font-display text-3xl font-extrabold text-gradient-brand sm:text-4xl">{s.value}</p>
              <p className="mt-1.5 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
