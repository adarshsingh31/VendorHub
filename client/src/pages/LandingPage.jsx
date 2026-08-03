import { useState } from 'react'
import { Link } from 'react-router-dom'

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const categories = [
  { icon: 'local_grocery_store', label: 'Groceries',       count: '380+', color: 'bg-[#eff4ff] text-[#004ac6]' },
  { icon: 'devices',             label: 'Electronics',     count: '210+', color: 'bg-[#dce9ff] text-[#004ac6]' },
  { icon: 'checkroom',           label: 'Fashion',         count: '460+', color: 'bg-[#eff4ff] text-[#004ac6]' },
  { icon: 'restaurant',          label: 'Food & Dining',   count: '540+', color: 'bg-[#dce9ff] text-[#004ac6]' },
  { icon: 'home',                label: 'Home Essentials', count: '190+', color: 'bg-[#eff4ff] text-[#004ac6]' },
  { icon: 'medication',          label: 'Pharmacy',        count: '120+', color: 'bg-[#dce9ff] text-[#004ac6]' },
]

const vendors = [
  { initials: 'SK', bg: 'bg-[#004ac6]', name: 'Sharma Kirana Store',  tag: 'Groceries · 0.6 km',  rating: 4.8, reviews: 312, desc: 'A neighborhood staple for 22 years — daily essentials and fresh produce sourced each morning.' },
  { initials: 'GB', bg: 'bg-[#2563eb]', name: 'Green Basket Grocers', tag: 'Groceries · 1.1 km',  rating: 4.7, reviews: 198, desc: 'Organic fruits, vegetables and pantry staples with same-morning delivery before 10 am.' },
  { initials: 'SJ', bg: 'bg-[#1d4ed8]', name: 'Style Junction',       tag: 'Fashion · 0.9 km',   rating: 4.6, reviews: 245, desc: 'Everyday and festive wear for the whole family, with free alterations on every purchase.' },
  { initials: 'SR', bg: 'bg-[#004ac6]', name: 'Spice Route Kitchen',  tag: 'Food · 0.4 km',      rating: 4.9, reviews: 521, desc: 'Home-style regional thalis and tiffins, cooked fresh and delivered within the hour.' },
  { initials: 'HN', bg: 'bg-[#2563eb]', name: 'HomeNest Essentials',  tag: 'Home · 1.4 km',      rating: 4.5, reviews: 134, desc: 'Everything from cookware to curtains, curated by a family shop running since 1998.' },
  { initials: 'TZ', bg: 'bg-[#1d4ed8]', name: 'TechZone Electronics', tag: 'Electronics · 1.8 km', rating: 4.7, reviews: 289, desc: 'Mobiles, accessories and repairs with a same-day diagnosis technician on-site.' },
]

const features = [
  { icon: 'location_on',       title: 'Hyperlocal Delivery',    desc: 'Orders ship from shops within a couple of kilometres — arriving fast and always fresh.' },
  { icon: 'shield_lock',       title: 'Secure Payments',        desc: 'Pay by card, UPI or cash on delivery. Every transaction is encrypted end to end.' },
  { icon: 'my_location',       title: 'Real-Time Tracking',     desc: 'Follow your order on a live map from the counter to your doorstep, minute by minute.' },
  { icon: 'shopping_cart',     title: 'One Cart, Every Vendor', desc: 'Mix items from several nearby shops in a single checkout — no juggling multiple apps.' },
  { icon: 'search',            title: 'Smart Search & Filter',  desc: 'Narrow by category, price, rating or distance to find exactly what you need, fast.' },
  { icon: 'verified',          title: 'Verified Stores Only',   desc: 'Every listed shop is physically verified and located in the neighbourhoods you walk through.' },
]

const steps = [
  { num: '01', icon: 'storefront',      title: 'Find Your Vendor',         desc: 'Search or browse by category to see what\'s open right now, sorted by distance.' },
  { num: '02', icon: 'add_shopping_cart', title: 'Order & Pay Securely',   desc: 'Add items from one or several shops to a single cart and pay with any method.' },
  { num: '03', icon: 'local_shipping',   title: 'Track It Live',           desc: 'Watch your order move from the counter to your door on a live map.' },
]

const testimonials = [
  { initials: 'A', name: 'Aditi Rao',    loc: 'Indiranagar, Bengaluru', quote: 'I get my vegetables from the same vendor my mother used to visit — just without leaving home. Always under 20 minutes.' },
  { initials: 'R', name: 'Ravi Prakash', loc: 'Owner, RP Electronics',  quote: 'VendorHub brought me customers three streets away who never knew my shop existed. Revenue doubled in four months.' },
  { initials: 'M', name: 'Meera Iyer',   loc: 'Powai, Mumbai',          quote: 'The live tracking is what won me over. I know exactly when to head downstairs — no guessing at all.' },
]

const stats = [
  { value: '12,400+', label: 'Registered Vendors', icon: 'storefront' },
  { value: '2.1M',    label: 'Orders Completed',   icon: 'shopping_bag' },
  { value: '96%',     label: 'Customer Satisfaction', icon: 'thumb_up' },
  { value: '40+',     label: 'Cities Covered',     icon: 'location_city' },
]

const footerCols = [
  { title: 'Company',     links: ['About Us', 'Careers', 'Blog', 'Contact'] },
  { title: 'For Vendors', links: ['List Your Shop', 'Vendor Dashboard', 'Pricing', 'Success Stories'] },
  { title: 'Support',     links: ['FAQs', 'Help Center', 'Report an Issue', 'Trust & Safety'] },
]

const promos = [
  '20% off your first Sharma Kirana order',
  'Free delivery on Spice Route Kitchen this weekend',
  'Flat ₹150 off Style Junction festive wear',
  'Buy 1 Get 1 at Green Basket Grocers',
]

/* ─────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
───────────────────────────────────────────── */

/** Section eyebrow label */
function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#004ac6] bg-[#eff4ff] border border-[#c3c6d7]/40 px-3 py-1 rounded-full mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-pulse" />
      {children}
    </span>
  )
}

/** Section heading block */
function SectionHead({ eyebrow, title, sub, center }) {
  return (
    <div className={`mb-10 ${center ? 'text-center mx-auto max-w-2xl' : 'max-w-xl'}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-3xl md:text-4xl font-bold text-[#0b1c30] tracking-tight leading-tight">{title}</h2>
      {sub && <p className="mt-3 text-base text-[#434655] leading-relaxed">{sub}</p>}
    </div>
  )
}

/** Primary CTA button — matches Login/Signup button style exactly */
function PrimaryBtn({ children, href, to, onClick, className = '' }) {
  const cls = `inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#004ac6] to-[#0053db] text-white text-sm font-semibold rounded-lg shadow-sm border border-white/20 hover:scale-[1.02] hover:shadow-md active:scale-95 transition-all duration-150 ${className}`
  if (to)   return <Link to={to} className={cls}>{children}</Link>
  if (href) return <a href={href} className={cls}>{children}</a>
  return <button onClick={onClick} className={cls}>{children}</button>
}

/** Ghost / secondary button */
function GhostBtn({ children, href, to, className = '' }) {
  const cls = `inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#004ac6] text-sm font-semibold rounded-lg border border-[#c3c6d7] hover:bg-[#eff4ff] transition-colors duration-150 ${className}`
  if (to)   return <Link to={to} className={cls}>{children}</Link>
  if (href) return <a href={href} className={cls}>{children}</a>
  return <button className={cls}>{children}</button>
}

/** Card wrapper — matches Dashboard card style */
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),_0_1px_2px_-1px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08),_0_4px_6px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-150 ${className}`}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] antialiased min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ══════════ NAV ══════════ */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 backdrop-blur-xl shadow-sm border-b border-[#c3c6d7]/30 h-20 flex items-center">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill text-[#004ac6] text-3xl">hub</span>
            <span className="text-2xl font-bold tracking-tight text-[#004ac6]">VendorHub</span>
          </a>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {[['#top','Home'],['#categories','Categories'],['#vendors','Vendors'],['#about','About']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-semibold text-[#434655] hover:text-[#004ac6] transition-colors">{label}</a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"  className="text-sm font-semibold text-[#434655] hover:text-[#004ac6] transition-colors">Log in</Link>
            <PrimaryBtn to="/signup">
              Get Started
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </PrimaryBtn>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#434655] hover:text-[#004ac6] transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="absolute top-20 left-0 right-0 bg-white border-b border-[#c3c6d7]/30 shadow-md md:hidden flex flex-col">
            {[['#top','Home'],['#categories','Categories'],['#vendors','Vendors'],['#about','About']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="px-6 py-4 text-sm font-semibold text-[#434655] hover:text-[#004ac6] hover:bg-[#eff4ff] transition-colors border-b border-[#c3c6d7]/20">
                {label}
              </a>
            ))}
            <div className="flex gap-3 p-4">
              <Link to="/login"  className="flex-1 text-center py-3 text-sm font-semibold text-[#004ac6] border border-[#c3c6d7] rounded-lg hover:bg-[#eff4ff] transition-colors">Log in</Link>
              <Link to="/signup" className="flex-1 text-center py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#004ac6] to-[#0053db] rounded-lg hover:shadow-md transition-all">Sign up</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow pt-20">

        {/* ══════════ HERO ══════════ */}
        <section id="top" className="relative overflow-hidden bg-[#f8f9ff]">
          {/* Decorative blobs — same as SignUp/ForgotPassword */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2563eb]/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#004ac6]/8 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/4 pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div className="flex flex-col gap-6 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] border border-[#c3c6d7]/40 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
                <span className="text-xs font-bold text-[#004ac6] tracking-widest uppercase">Live in 40+ neighborhoods</span>
              </div>

              <h1 className="text-[36px] md:text-[56px] font-bold leading-tight md:leading-[1.1] tracking-tight text-[#0b1c30]">
                Support Local.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004ac6] to-[#2563eb]">
                  Shop Smarter.
                </span>
              </h1>

              <p className="text-lg text-[#434655] max-w-lg leading-relaxed">
                VendorHub connects you to the kirana store, tailor, and café you already trust — with delivery times measured in minutes, not days.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <PrimaryBtn href="#categories">
                  Shop Now
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </PrimaryBtn>
                <GhostBtn href="#vendor-cta">
                  <span className="material-symbols-outlined text-sm">storefront</span>
                  Become a Vendor
                </GhostBtn>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-3">
                  {['#004ac6','#2563eb','#1d4ed8','#3b82f6'].map((bg, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#f8f9ff] flex items-center justify-center text-white text-xs font-bold" style={{ background: bg }}>
                      {['S','R','A','M'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#434655]">
                  <span className="font-bold text-[#0b1c30]">10,000+</span> satisfied customers locally
                </p>
              </div>
            </div>

            {/* Illustration panel — matches LoginPage's right panel style */}
            <div className="hidden lg:block relative">
              <div className="relative bg-[#eff4ff] rounded-2xl overflow-hidden border border-[#c3c6d7]/30 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),_0_8px_10px_-6px_rgba(0,0,0,0.06)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9ff]/40 to-[#2563eb]/10 backdrop-blur-[2px]" />
                <div className="relative z-10 p-8 flex flex-col gap-4">
                  {/* Hero stat cards  */}
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    {stats.slice(0,4).map(s => (
                      <Card key={s.label} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-xs font-semibold text-[#434655]">{s.label}</p>
                          <div className="p-1.5 bg-[#eff4ff] rounded-lg text-[#004ac6]">
                            <span className="material-symbols-outlined text-sm">{s.icon}</span>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-[#0b1c30]">{s.value}</p>
                      </Card>
                    ))}
                  </div>
                  {/* Floating delivery badge */}
                  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-xl border border-[#c3c6d7]/30 shadow-md p-3">
                    <div className="w-10 h-10 rounded-full bg-[#004ac6] flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined icon-fill text-sm">check_circle</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#434655]">Order #ORD-0921 · Sharma Kirana</p>
                      <p className="text-sm font-semibold text-[#0b1c30]">Out for delivery · 4 min away</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-[#34A853] bg-green-50 px-2 py-0.5 rounded-full">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section className="bg-white border-y border-[#c3c6d7]/20 py-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <SectionHead center eyebrow="How It Works" title="From craving to doorstep in three steps." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {steps.map((step, i) => (
                <Card key={step.num} className="p-6 flex flex-col items-center text-center group">
                  <div className="relative mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#004ac6] group-hover:text-white transition-colors duration-200">
                      <span className="material-symbols-outlined">{step.icon}</span>
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#004ac6] text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0b1c30] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#434655] leading-relaxed">{step.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ CATEGORIES ══════════ */}
        <section id="categories" className="py-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <SectionHead eyebrow="Categories" title="Shop by what you need today." sub="Every category is stocked by real shops in your neighborhood — not a warehouse three states away." />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(cat => (
                <Card key={cat.label} className="p-5 flex flex-col items-center text-center cursor-pointer group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${cat.color} group-hover:scale-110 transition-transform duration-200`}>
                    <span className="material-symbols-outlined">{cat.icon}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0b1c30]">{cat.label}</h3>
                  <p className="text-xs text-[#737686] mt-1">{cat.count} vendors</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FEATURED VENDORS ══════════ */}
        <section id="vendors" className="bg-white border-y border-[#c3c6d7]/20 py-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <SectionHead eyebrow="Featured Vendors" title="Trusted shops, rated by your neighbors." />
              <a href="#categories" className="text-sm font-semibold text-[#004ac6] hover:text-[#2563eb] transition-colors flex items-center gap-1 mb-10 shrink-0">
                View all vendors
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vendors.map(v => (
                <Card key={v.name} className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl ${v.bg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>{v.initials}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0b1c30] truncate">{v.name}</p>
                      <p className="text-xs text-[#737686]">{v.tag}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#434655] leading-relaxed mb-4">{v.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings:"'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold text-[#0b1c30]">{v.rating}</span>
                      <span className="text-xs text-[#737686]">({v.reviews})</span>
                    </div>
                    <button className="text-xs font-semibold text-[#004ac6] hover:text-[#2563eb] transition-colors flex items-center gap-0.5">
                      View shop
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section id="about" className="py-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <SectionHead center eyebrow="Why VendorHub" title="Built for the way your street actually shops." sub="A seamless platform designed to connect you with the best local vendors, ensuring quality and speed." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(f => (
                <Card key={f.title} className="p-6 group">
                  <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#004ac6] mb-4 group-hover:bg-[#004ac6] group-hover:text-white group-hover:scale-110 transition-all duration-200">
                    <span className="material-symbols-outlined">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0b1c30] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#434655] leading-relaxed">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ STATS BAR ══════════ */}
        <section className="bg-[#004ac6] py-16">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map(s => (
                <div key={s.label}>
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">{s.icon}</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-white/70 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ TESTIMONIALS ══════════ */}
        <section className="bg-white border-y border-[#c3c6d7]/20 py-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <SectionHead center eyebrow="Testimonials" title="What your neighbors are saying." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map(t => (
                <Card key={t.name} className="p-6 flex flex-col gap-4">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className="material-symbols-outlined text-[16px] text-yellow-500" style={{ fontVariationSettings:"'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-sm text-[#434655] leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#004ac6] to-[#2563eb] flex items-center justify-center text-white text-sm font-bold shrink-0">{t.initials}</div>
                    <div>
                      <p className="text-sm font-bold text-[#0b1c30]">{t.name}</p>
                      <p className="text-xs text-[#737686]">{t.loc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ PROMO TICKER ══════════ */}
        <div className="bg-[#eff4ff] border-y border-[#c3c6d7]/30 py-3 overflow-hidden" style={{ contain: 'paint' }}>
          <div className="flex gap-10 whitespace-nowrap animate-[scroll-left_24s_linear_infinite] hover:[animation-play-state:paused] w-max">
            {[...promos, ...promos].map((p, i) => (
              <span key={i} className="text-sm font-semibold text-[#004ac6] flex items-center gap-2">
                <span className="material-symbols-outlined icon-fill text-[#004ac6] text-sm">local_offer</span>
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════ CTA BAND ══════════ */}
        <section id="vendor-cta" className="py-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <div className="relative bg-gradient-to-r from-[#004ac6] to-[#0053db] rounded-2xl p-10 md:p-16 text-center overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,74,198,0.3),_0_8px_10px_-6px_rgba(0,74,198,0.2)]">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-white/70 bg-white/10 border border-white/20 px-3 py-1 rounded-full mb-4">
                  <span className="material-symbols-outlined icon-fill text-xs">storefront</span>
                  For Vendors
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Own a shop? Bring it online in a day.</h2>
                <p className="text-base text-white/75 max-w-md mx-auto mb-8">
                  List your store, set your delivery radius, and start taking orders from customers already searching your street.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-[#004ac6] text-sm font-bold rounded-lg hover:bg-[#eff4ff] hover:scale-[1.02] active:scale-95 transition-all duration-150 shadow-sm"
                  >
                    Become a Vendor
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-transparent text-white text-sm font-bold rounded-lg border border-white/40 hover:bg-white/10 transition-colors duration-150">
                    <span className="material-symbols-outlined text-sm">chat</span>
                    Talk to Our Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-white border-t border-[#c3c6d7]/20 w-full mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-10 border-b border-[#c3c6d7]/20">
            {/* Brand */}
            <div className="col-span-2 flex flex-col gap-4 pr-0 md:pr-8">
              <a href="#top" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-2xl icon-fill">hub</span>
                <span className="text-xl font-black text-[#0b1c30] tracking-tight">VendorHub</span>
              </a>
              <p className="text-sm text-[#434655] leading-relaxed">
                Connecting customers with trusted local vendors — groceries, fashion, food, electronics and everything in between, delivered from shops on your own street.
              </p>
              <p className="text-sm text-[#5d5f5f] mt-auto pt-2">© 2026 VendorHub Inc. All rights reserved.</p>
            </div>

            {/* Link columns */}
            {footerCols.map(col => (
              <div key={col.title} className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-[#0b1c30] mb-1">{col.title}</h4>
                {col.links.map(l => (
                  <a key={l} href="#" className="text-sm text-[#5d5f5f] hover:text-[#004ac6] hover:translate-x-1 transition-all duration-150">{l}</a>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
            <p className="text-sm text-[#5d5f5f]">Empowering local commerce through seamless digital experiences.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Help Center'].map(l => (
                <a key={l} href="#" className="text-sm text-[#5d5f5f] hover:text-[#004ac6] transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Promo ticker keyframe */}
      <style>{`
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
