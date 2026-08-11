import { Link } from 'react-router-dom'
import { ShoppingBag, MapPin, Star, TrendingUp } from 'lucide-react'

export default function AuthLayout({ children, heading, subheading }) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left branding panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-12 py-10 text-white lg:flex xl:px-16">
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <ShoppingBag size={18} strokeWidth={2.3} />
          </span>
          <span className="font-display text-lg font-extrabold">VendorHub</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight xl:text-[2.75rem]">
            {heading}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-brand-100">{subheading}</p>

          <div className="mt-10 flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">500+ local sellers</p>
                <p className="text-xs text-brand-100">Discover shops near you</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <TrendingUp size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">AI-powered recommendations</p>
                <p className="text-xs text-brand-100">Shopping that gets smarter</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Star size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">4.8/5 average rating</p>
                <p className="text-xs text-brand-100">Loved by local shoppers</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-brand-200">© 2026 VendorHub. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen w-full flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <ShoppingBag size={18} strokeWidth={2.3} />
          </span>
          <span className="font-display text-lg font-extrabold text-ink-900">VendorHub</span>
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
