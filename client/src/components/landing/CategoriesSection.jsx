import { categories } from '../../data/landingData.js'
import CategoryCard from './CategoryCard.jsx'

export default function CategoriesSection() {
  return (
    <section id="categories" className="py-20 sm:py-24">
      <div className="container-page">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Explore Popular Categories
          </h2>
          <p className="mt-3 text-[15px] text-ink-500">Find everything you need from sellers around you.</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.name} {...cat} />
          ))}
        </div>
      </div>
    </section>
  )
}
