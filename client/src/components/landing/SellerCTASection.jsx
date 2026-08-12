import { Link } from 'react-router-dom'
import { CheckCircle2, Store, ArrowRight } from 'lucide-react'
import VHButton from '../VHButton.jsx'
import { sellerFeatures } from '../../data/landingData.js'

export default function SellerCTASection() {
  return (
    <section id="seller" className="py-6 sm:py-8">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-white sm:px-14 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)',
              backgroundSize: '26px 26px',
            }}
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
                <Store size={13} /> For sellers
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Turn Your Local Business Into an Online Store
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">
                Reach more customers, manage your products, track orders and grow your business with
                VendorHub.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup">
                  <VHButton variant="primary" size="lg" icon={ArrowRight} iconPosition="right" fullWidth className="sm:w-auto">
                    Become a Seller
                  </VHButton>
                </Link>
                <button className="text-sm font-semibold text-white underline underline-offset-4 decoration-white/40 transition-colors hover:decoration-white sm:ml-2">
                  Learn More
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sellerFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur"
                >
                  <CheckCircle2 size={16} className="shrink-0 text-primary" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
