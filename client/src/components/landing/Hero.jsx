import { Link } from 'react-router-dom'
import { MapPin, ShoppingCart, Sparkles, BadgeCheck, Bell, ArrowRight, Store } from 'lucide-react'
import VHButton from '../VHButton.jsx'
import SearchBar from './SearchBar.jsx'
import ProductCard from './ProductCard.jsx'

const avatars = [
  'from-brand-400 to-brand-600',
  'from-local-400 to-local-600',
  'from-ai-400 to-ai-600',
  'from-amber-400 to-orange-500',
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-gradient-to-b from-brand-50 via-white to-white"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 -z-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-64 -z-10 h-80 w-80 rounded-full bg-local-100/60 blur-3xl"
      />

      <div className="container-page grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        {/* Left: copy + search */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
            <MapPin size={13} /> Hyperlocal marketplace, reimagined
          </span>

          <h1 className="mt-5 font-display text-[2.6rem] font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-6xl">
            Shop Local.
            <br />
            <span className="text-gradient-brand">Discover More.</span>
          </h1>

          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink-500">
            Discover products from trusted local sellers, shop effortlessly, and get recommendations
            tailored to what you love.
          </p>

          <div className="mt-8 max-w-xl">
            <SearchBar />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup">
              <VHButton variant="primary" size="lg" icon={ArrowRight} iconPosition="right" fullWidth className="sm:w-auto">
                Start Shopping
              </VHButton>
            </Link>
            <Link to="/signup">
              <VHButton variant="secondary" size="lg" icon={Store} fullWidth className="sm:w-auto">
                Become a Seller
              </VHButton>
            </Link>
          </div>

          <div className="mt-9 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {avatars.map((grad, i) => (
                <span
                  key={i}
                  className={`h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br ${grad}`}
                />
              ))}
            </div>
            <p className="text-sm text-ink-500">
              <span className="font-semibold text-ink-900">Trusted</span> by local buyers and sellers
            </p>
          </div>
        </div>

        {/* Right: local pulse visual composition */}
        <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[500px]">
          {/* radar pulse rings */}
          <div className="absolute left-1/2 top-1/2 -z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <span className="absolute h-16 w-16 rounded-full border border-brand-400/50 animate-radar" />
            <span className="absolute h-16 w-16 rounded-full border border-brand-400/50 animate-radar [animation-delay:0.9s]" />
            <span className="absolute h-16 w-16 rounded-full border border-brand-400/50 animate-radar [animation-delay:1.8s]" />
          </div>

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
              <MapPin size={26} strokeWidth={2.2} />
            </span>
            <span className="mt-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-700 shadow-soft">
              You are here
            </span>
          </div>

          <ProductCard
            name="Wireless Earbuds"
            price="$59"
            seller="TechZone"
            gradient="from-brand-100 to-brand-200"
            className="absolute left-0 top-2 animate-float [animation-delay:0.2s]"
          />

          <ProductCard
            name="Ceramic Planter"
            price="$24"
            seller="Homeware Corner"
            gradient="from-amber-100 to-orange-200"
            className="absolute -right-2 top-16 animate-float [animation-delay:1s] sm:right-2"
          />

          <div className="absolute bottom-6 left-1 flex items-center gap-2.5 rounded-2xl border border-border bg-white px-3.5 py-3 shadow-soft-lg animate-float [animation-delay:0.5s]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-local-50 text-local-600">
              <BadgeCheck size={17} />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink-900">Local Seller</p>
              <p className="text-[11px] text-ink-400">2.4 km away</p>
            </div>
          </div>

          <div className="absolute bottom-2 right-0 flex items-center gap-2.5 rounded-2xl border border-ai-500/20 bg-white px-3.5 py-3 shadow-soft-lg animate-float [animation-delay:1.4s] sm:right-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ai-50 text-ai-600">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink-900">For You</p>
              <p className="text-[11px] text-ink-400">AI recommended</p>
            </div>
          </div>

          <div className="absolute right-2 top-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-soft-lg animate-float [animation-delay:0.7s] sm:right-8">
            <ShoppingCart size={18} className="text-brand-600" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-local-500 text-[10px] font-bold text-white">3</span>
          </div>

          <div className="absolute left-4 bottom-32 hidden items-center gap-2 rounded-full bg-white px-3 py-2 shadow-soft-lg animate-float [animation-delay:1.7s] sm:flex">
            <Bell size={14} className="text-brand-600" />
            <span className="text-[11px] font-medium text-ink-700">Order confirmed ✓</span>
          </div>
        </div>
      </div>
    </section>
  )
}
