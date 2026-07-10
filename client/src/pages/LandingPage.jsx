import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="antialiased min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9ff', color: '#0b1c30' }}>
      {/* Navbar */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-[#c3c6d7]/30 ${
          scrolled
            ? 'bg-[#f8f9ff]/70 backdrop-blur-xl shadow-md'
            : 'bg-[#f8f9ff]/70 backdrop-blur-xl shadow-sm'
        }`}
        id="navbar"
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex justify-between items-center h-20">
          {/* Brand */}
          <a className="flex items-center gap-2 group" href="#">
            <span className="material-symbols-outlined text-[#004ac6] text-3xl font-bold group-hover:scale-110 transition-transform">hub</span>
            <span className="text-2xl font-bold tracking-tight text-[#004ac6]">VendorHub</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-[#004ac6] font-semibold border-b-2 border-[#004ac6] py-1" href="#home">Home</a>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors py-1" href="#features">Features</a>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors py-1" href="#how-it-works">How It Works</a>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors py-1" href="#vendors">Vendors</a>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors py-1" href="#contact">Contact</a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#434655] hover:text-[#004ac6] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-[#004ac6] to-[#0053db] text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-sm border border-white/20 hover:scale-[1.02] hover:shadow-md active:scale-95 transition-all duration-150"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-[#434655] hover:text-[#004ac6] p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative max-w-[1280px] mx-auto px-4 md:px-8 pt-12 pb-32 overflow-hidden" id="home">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#2563eb]/20 rounded-bl-[120px] -z-10 blur-3xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col space-y-4 z-10">
              <h1 className="text-[32px] leading-10 md:text-[56px] md:leading-[64px] md:tracking-tight md:font-bold font-bold text-[#0b1c30]">
                Support Local. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004ac6] to-[#0053db]">
                  Shop Smarter.
                </span>
              </h1>
              <p className="text-lg text-[#434655] max-w-xl">
                Order groceries, food, electronics, medicines, and daily essentials from trusted nearby vendors with fast, reliable delivery right to your door.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button className="bg-gradient-to-r from-[#004ac6] to-[#0053db] text-white text-sm font-semibold px-8 py-4 rounded-xl shadow-sm border border-white/20 hover:scale-[1.02] hover:shadow-md active:scale-95 transition-all duration-150 flex items-center gap-2">
                  Shop Now
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button className="bg-[#f8f9ff] text-[#0b1c30] text-sm font-semibold px-8 py-4 rounded-xl border border-[#e2e2e2] hover:bg-[#eff4ff] hover:scale-[1.02] transition-all duration-150 shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">storefront</span>
                  Become a Vendor
                </button>
              </div>
              <div className="pt-6 flex items-center gap-4 text-[#434655] text-sm">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-[#f8f9ff] object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD30xP5lQlbikDCIALqm81KanRBOOMFY2kTnOR-m_W-RZ5lbxF7drKR9y92HkjUA8EPZqhQLuStJ189qPpNjVX2Jzcq9Revq2QnZd6k5-mTZNn3bQrPglSLZD9fw6ji8q9SpI6DQGrdPdoEJyx-wpUsEFw-isZ1Tu_B7DBTvXxMxQ9t_nF35Z3Z4QEFMoVbHtYEXqg1PcPo9Tb0uuGB8r59i8wKBvYip5AF9MOjq7Lx553rblnORlcXlNaEXbOeHww8VspUs9wrXG2u" alt="Customer" />
                  <img className="w-10 h-10 rounded-full border-2 border-[#f8f9ff] object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARW5XbCWu0AXY-wQGz6CTTAmrdBaFgOP-VNENwW1b0B82C578I9HBC8I0GqlNMJ4XGREf-0r9uTNc5mQcV_rFBPzqJoqh6GHtcWfBL10tH2mnDqXGwFeVvNfnTLsrHHnIbGWvY4rpyxsTbbWvqjMXDmByaMVjRj7j70nH6nLoATO_2z5nLrm1vTv7oQdS9aDFx9UJb9CzE8onh8I_NCV9ueM20fksQRLKurySbaJgW3fFxP7aTvsO4XKeEdvxZcyq3R9sP9NZSgwOn" alt="Customer" />
                  <img className="w-10 h-10 rounded-full border-2 border-[#f8f9ff] object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1MsOHNOEFLgEBtJw7PoHoYMEKU0ges5ZbXzuuWE3Nirbe2q0uAp5TvBHE3CUrSZzFi0gy2TamfIvU3V4LhsEz7ozq_LN3T5tscEJ7w6sMxluxBYXvfgbLclbb1S5YFalE9Klcdgom-pSPLde3sDVtDEF3mSqtieJdvSDIUeEm_jpiV_rbSp_VOwtXkIOZPUjI53HDdgcBk8EeABZD_0qMWQLZC23lz42Kr8Jb9kgl8m3zz5I7at4wAgl7WVbknpMP3LK9VBi4NLsd" alt="Customer" />
                </div>
                <p><span className="font-bold text-[#0b1c30]">10K+</span> satisfied customers locally.</p>
              </div>
            </div>

            <div className="relative w-full h-[500px] hidden lg:block rounded-3xl overflow-hidden glass-panel shadow-lg hover-lift">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJRF07UYzepxx0zyz-ncrROMsp42s0C9bAaE51ApbGXgqjGPtN6niLAepWJV0uepWCaMOO0kk-_bAOBzNM-ab6CJcrH4GoE-OytkLsBbwgtvCyNJimv381VAOVPxim7Dt1UloCMKZH9VlWwFJBr8BPWKv_jY6n52_HVgUCyBYrv2-wy5MAYqLlWC8oolbDdMEhnwbcqiYATYsjFHwxziA7c1wzz1jWowCdYyUQtAIJJO4nTJDatG0GsZtml9qLkIu7Zw0mdfl1_0Si"
                alt="VendorHub marketplace"
              />
              <div className="absolute top-8 left-8 bg-[#f8f9ff]/90 backdrop-blur-md p-3 rounded-2xl shadow-md border border-white/50 flex items-center gap-3 animate-bounce">
                <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="text-xs text-[#434655]">Order Delivered</p>
                  <p className="text-sm font-semibold text-[#0b1c30]">Just now</p>
                </div>
              </div>
              <div className="absolute bottom-12 right-12 bg-[#f8f9ff]/90 backdrop-blur-md p-3 rounded-2xl shadow-md border border-white/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffddb8] flex items-center justify-center text-[#784b00]">
                  <span className="material-symbols-outlined">store</span>
                </div>
                <div>
                  <p className="text-xs text-[#434655]">Fresh Produce Co.</p>
                  <p className="text-sm font-semibold text-[#0b1c30]">Accepted Order</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12" id="features">
          <div className="text-center mb-16">
            <h2 className="text-[32px] md:text-[36px] font-bold tracking-tight text-[#0b1c30] mb-4">
              Everything you need, right here.
            </h2>
            <p className="text-lg text-[#434655] max-w-2xl mx-auto">
              A seamless platform designed to connect you with the best local vendors, ensuring quality and speed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-[#f8f9ff] rounded-2xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),_0_1px_2px_-1px_rgba(0,0,0,0.05)] border border-[#e2e2e2] hover-lift group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.iconBg}`}>
                  <span className={`material-symbols-outlined ${feature.iconColor}`}>{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-[#0b1c30] mb-2">{feature.title}</h3>
                <p className="text-base text-[#434655]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-12 bg-white border-t border-[#c3c6d7]/20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="col-span-2 flex flex-col gap-4 pr-8">
            <a className="flex items-center gap-2" href="#">
              <span className="material-symbols-outlined text-[#004ac6] text-2xl font-bold">hub</span>
              <span className="text-xl font-black text-[#0b1c30] tracking-tight">VendorHub</span>
            </a>
            <p className="text-sm text-[#5d5f5f]">Empowering local commerce through seamless digital experiences. Reliable, fast, and secure.</p>
            <p className="text-sm text-[#5d5f5f] mt-auto pt-4">© 2024 VendorHub Inc. All rights reserved.</p>
          </div>
          {footerLinks.map((col, i) => (
            <div key={i} className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-[#0b1c30] mb-2">{col.title}</h4>
              {col.links.map((link, j) => (
                <a key={j} className="text-sm text-[#5d5f5f] hover:text-[#004ac6] hover:translate-x-1 transition-all duration-150" href="#">{link}</a>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}

const features = [
  { icon: 'location_on', iconBg: 'bg-[#2563eb]', iconColor: 'text-white', title: 'Nearby Stores', desc: 'Discover a wide range of trusted vendors right in your neighborhood, supporting the local economy.' },
  { icon: 'local_shipping', iconBg: 'bg-[#d3e4fe]', iconColor: 'text-[#004ac6]', title: 'Fast Delivery', desc: 'Get your essentials delivered swiftly with our optimized local logistics network.' },
  { icon: 'category', iconBg: 'bg-[#dce9ff]', iconColor: 'text-[#0b1c30]', title: 'Multiple Vendors', desc: 'Compare prices and products from various sellers to find exactly what you need.' },
  { icon: 'shield_lock', iconBg: 'bg-[#ffddb8]', iconColor: 'text-[#784b00]', title: 'Secure Payments', desc: 'Enjoy peace of mind with encrypted, multi-gateway secure transactions for every order.' },
  { icon: 'my_location', iconBg: 'bg-[#eaf1ff]', iconColor: 'text-[#213145]', title: 'Real-Time Tracking', desc: "Follow your delivery's journey on a live map from the store straight to your doorstep." },
  { icon: 'assignment_return', iconBg: 'bg-[#ffdad6]', iconColor: 'text-[#ba1a1a]', title: 'Easy Returns', desc: 'Hassle-free return policies managed directly through the platform for eligible items.' },
]

const footerLinks = [
  { title: 'Company', links: ['About Us', 'Careers', 'Press'] },
  { title: 'Platform', links: ['Features', 'Pricing', 'Vendors Directory'] },
  { title: 'Resources', links: ['Help Center', 'API Docs', 'Community'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Contact'] },
]
