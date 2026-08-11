import { Link } from 'react-router-dom'
import { ArrowRight, Store } from 'lucide-react'
import VHButton from '../VHButton.jsx'

export default function FinalCTASection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-16 text-center sm:px-14 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-900/60 via-ink-900 to-ink-900"
          />
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl" />

          <div className="relative mx-auto max-w-xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to Shop Local?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-300">
              Discover amazing products from sellers around you.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/signup">
                <VHButton variant="primary" size="lg" icon={ArrowRight} iconPosition="right" fullWidth className="sm:w-auto">
                  Start Shopping
                </VHButton>
              </Link>
              <Link to="/signup">
                <VHButton variant="outlineLight" size="lg" icon={Store} fullWidth className="sm:w-auto">
                  Become a Seller
                </VHButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
