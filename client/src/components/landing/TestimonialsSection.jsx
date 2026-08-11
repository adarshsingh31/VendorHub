import { testimonials } from '../../data/landingData.js'
import TestimonialCard from './TestimonialCard.jsx'

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Loved by Local Shoppers
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  )
}
