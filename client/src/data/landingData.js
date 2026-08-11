import {
  Smartphone, Shirt, Carrot, Sofa, Sparkles, Dumbbell, BookOpen, Watch,
} from 'lucide-react'

export const categories = [
  { name: 'Electronics', count: '1,240 products', icon: Smartphone },
  { name: 'Fashion', count: '2,180 products', icon: Shirt },
  { name: 'Grocery', count: '3,050 products', icon: Carrot },
  { name: 'Home & Living', count: '980 products', icon: Sofa },
  { name: 'Beauty', count: '760 products', icon: Sparkles },
  { name: 'Sports', count: '540 products', icon: Dumbbell },
  { name: 'Books', count: '410 products', icon: BookOpen },
  { name: 'Accessories', count: '890 products', icon: Watch },
]

export const nearbySellers = [
  {
    name: 'TechZone Store',
    category: 'Electronics · Gadgets',
    rating: 4.8,
    distance: '2.4 km away',
    delivery: 'Delivery today',
    verified: true,
    initials: 'TZ',
    color: 'from-brand-500 to-brand-700',
  },
  {
    name: 'Fresh & Local Mart',
    category: 'Grocery · Produce',
    rating: 4.9,
    distance: '1.1 km away',
    delivery: 'Delivery in 45 min',
    verified: true,
    initials: 'FL',
    color: 'from-local-500 to-local-600',
  },
  {
    name: 'Studio Thread Co.',
    category: 'Fashion · Apparel',
    rating: 4.7,
    distance: '3.6 km away',
    delivery: 'Delivery tomorrow',
    verified: true,
    initials: 'ST',
    color: 'from-ai-500 to-ai-600',
  },
  {
    name: 'Homeware Corner',
    category: 'Home & Living',
    rating: 4.6,
    distance: '4.8 km away',
    delivery: 'Delivery today',
    verified: false,
    initials: 'HC',
    color: 'from-amber-500 to-orange-600',
  },
]

export const testimonials = [
  {
    name: 'Ananya Rao',
    location: 'Bengaluru, IN',
    rating: 5,
    review:
      'I found a home decor seller two streets away I never knew existed. Delivery took under an hour and the packaging felt genuinely local.',
  },
  {
    name: 'Marcus Webb',
    location: 'Austin, TX',
    rating: 5,
    review:
      "The AI search actually understands what I mean. I typed 'laptop bag' and it surfaced options I'd never have found searching manually.",
  },
  {
    name: 'Priya Nair',
    location: 'Kochi, IN',
    rating: 4,
    review:
      'As a small seller, VendorHub gave me an online storefront in a weekend. Order and inventory management is genuinely easy to use.',
  },
]

export const stats = [
  { value: '10K+', label: 'Local Products' },
  { value: '2K+', label: 'Active Buyers' },
  { value: '500+', label: 'Local Sellers' },
  { value: '4.8/5', label: 'Average Rating' },
]

export const sellerFeatures = [
  'Easy product listing',
  'Inventory management',
  'Order management',
  'Earnings dashboard',
  'Sales analytics',
  'Low-stock alerts',
]

export const aiSearchTerms = ['Laptop Bag', 'Notebook Carry Case', 'Computer Backpack']
