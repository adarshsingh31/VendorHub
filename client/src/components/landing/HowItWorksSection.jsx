import { Compass, ShoppingBag, PackageCheck } from 'lucide-react'

const steps = [
  {
    n: '01',
    icon: Compass,
    title: 'Discover',
    desc: 'Find products from trusted local sellers.',
  },
  {
    n: '02',
    icon: ShoppingBag,
    title: 'Shop',
    desc: 'Add products to your cart and checkout securely.',
  },
  {
    n: '03',
    icon: PackageCheck,
    title: 'Receive',
    desc: 'Track your order from confirmation to delivery.',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-surface-soft py-20 sm:py-24">
      <div className="container-page">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Everything You Need. All in One Place.
          </h2>
        </div>

        <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-14 hidden h-px bg-border sm:block" />
          {steps.map((step) => (
            <div
              key={step.n}
              className="relative flex flex-col items-start rounded-3xl border border-border bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <span className="font-display text-4xl font-extrabold text-brand-100">{step.n}</span>
              <span className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <step.icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
