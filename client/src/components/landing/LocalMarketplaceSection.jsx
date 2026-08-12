import { Store } from 'lucide-react'
import { nearbySellers } from '../../data/landingData.js'
import SellerCard from './SellerCard.jsx'

export default function LocalMarketplaceSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent">
            <Store size={13} /> Nearby & verified
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Your Local Marketplace, Online
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-text-muted">
            Support local businesses while enjoying the convenience of modern online shopping.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {nearbySellers.map((seller) => (
            <SellerCard key={seller.name} {...seller} />
          ))}
        </div>
      </div>
    </section>
  )
}
