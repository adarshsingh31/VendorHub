import { nearbySellers } from '../../data/landingData.js'
import SellerCard from './SellerCard.jsx'

export default function LocalMarketplaceSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-local-500/25 bg-local-50 px-3.5 py-1.5 text-xs font-semibold text-local-600">
            Nearby &amp; verified
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Your Local Marketplace, Online
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-500">
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
