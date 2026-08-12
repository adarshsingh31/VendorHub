import { useState } from 'react'
import { Search } from 'lucide-react'

export default function SearchBar({
  placeholder = 'Search for products, brands or categories...',
  size = 'lg',
  onSearch,
}) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(value)
  }

  const isLg = size === 'lg'

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full items-center gap-2 rounded-full border border-border bg-white p-1.5 shadow-soft transition-shadow duration-200 focus-within:shadow-soft-lg focus-within:border-brand-300 ${
        isLg ? 'sm:p-2' : ''
      }`}
    >
      <Search size={isLg ? 20 : 18} className="ml-3 shrink-0 text-text-muted" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="text"
        placeholder={placeholder}
        className={`min-w-0 flex-1 bg-transparent text-text placeholder:text-text-muted outline-none ${
          isLg ? 'text-[15px] py-2.5' : 'text-sm py-1.5'
        }`}
      />
      <button
        type="submit"
        className={`shrink-0 rounded-full bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 ${
          isLg ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-sm'
        }`}
      >
        Search
      </button>
    </form>
  )
}
