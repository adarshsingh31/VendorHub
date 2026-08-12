import { Link } from 'react-router-dom'
import { ShoppingBag, MapPin, Star, TrendingUp } from 'lucide-react'

export default function AuthLayout({ children, heading, subheading }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left branding panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-ink px-12 py-10 text-white lg:flex xl:px-16">
        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 backdrop-blur">
            <ShoppingBag size={18} strokeWidth={2.3} className="text-primary" />
          </span>
          <span className="font-display text-lg font-bold">
            Vendor<span className="text-primary">Hub</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight xl:text-[2.75rem]">
            {heading}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">{subheading}</p>

          <div className="mt-10 flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/05 p-4 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <MapPin size={18} className="text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold">500+ local sellers</p>
                <p className="text-xs text-white/60">Discover shops near you</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/05 p-4 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <TrendingUp size={18} className="text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold">AI-powered recommendations</p>
                <p className="text-xs text-white/60">Shopping that gets smarter</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/05 p-4 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <Star size={18} className="text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold">4.8/5 average rating</p>
                <p className="text-xs text-white/60">Loved by local shoppers</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/40">© 2026 VendorHub. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen w-full flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content">
            <ShoppingBag size={18} strokeWidth={2.3} />
          </span>
          <span className="font-display text-lg font-bold text-text">Vendor<span className="text-primary">Hub</span></span>
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
