import { ShoppingBag, MapPin, Search, Sparkles, Lock, Package, Heart, Star } from 'lucide-react'
import FeatureCard from './FeatureCard.jsx'

const features = [
  { icon: ShoppingBag, title: 'Easy Shopping', description: 'Browse and purchase products effortlessly.', accent: 'brand' },
  { icon: MapPin, title: 'Local Discovery', description: 'Discover sellers and products near you.', accent: 'local' },
  { icon: Search, title: 'Smart Search', description: 'AI-powered fuzzy search and synonyms.', accent: 'ai' },
  { icon: Sparkles, title: 'AI Recommendations', description: 'Personalized product suggestions.', accent: 'ai' },
  { icon: Lock, title: 'Secure Checkout', description: 'Sandbox payment integration using Razorpay/Stripe.', accent: 'brand' },
  { icon: Package, title: 'Order Tracking', description: 'Track orders from placed to delivered.', accent: 'local' },
  { icon: Heart, title: 'Wishlist', description: 'Save products for later.', accent: 'amber' },
  { icon: Star, title: 'Reviews', description: 'Rate products after delivery.', accent: 'amber' },
]

export default function FeaturesSection() {
  return (
    <section className="bg-surface-soft py-20 sm:py-24">
      <div className="container-page">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Built for Modern Local Commerce
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}
