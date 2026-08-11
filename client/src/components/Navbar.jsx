import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, Search, ShoppingCart, Menu, X } from 'lucide-react'
import VHButton from './VHButton.jsx'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/#categories' },
  { label: 'Categories', to: '/#categories' },
  { label: 'How It Works', to: '/#how-it-works' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, role, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'border-b border-border/80 bg-white/75 backdrop-blur-lg shadow-[0_1px_0_rgba(14,18,36,0.02)]' : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex h-18 items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
            <ShoppingBag size={19} strokeWidth={2.3} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">VendorHub</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-sunken hover:text-brand-600"
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface-sunken hover:text-ink-900"
          >
            <Search size={19} />
          </button>
          {isAuthenticated ? (
            <>
              <Link to={role === 'admin' ? '/admin' : role === 'seller' ? '/seller' : '/buyer'}>
                <VHButton variant="ghost" size="sm">Dashboard</VHButton>
              </Link>
              <VHButton variant="primary" size="sm" onClick={logout}>Log Out</VHButton>
            </>
          ) : (
            <>
              <Link to="/login">
                <VHButton variant="ghost" size="sm">Log In</VHButton>
              </Link>
              <Link to="/signup">
                <VHButton variant="primary" size="sm">Sign Up</VHButton>
              </Link>
            </>
          )}
          <button
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface-sunken hover:text-ink-900"
          >
            <ShoppingCart size={19} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-local-500" />
          </button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <button
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-500 hover:bg-surface-sunken"
          >
            <ShoppingCart size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-local-500" />
          </button>
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-surface-sunken"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-white/98 backdrop-blur-lg lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink-700 transition-colors hover:bg-surface-sunken"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2.5 border-t border-border pt-4">
              {isAuthenticated ? (
                <>
                  <Link to={role === 'admin' ? '/admin' : role === 'seller' ? '/seller' : '/buyer'} onClick={() => setMobileOpen(false)}>
                    <VHButton variant="secondary" fullWidth>Dashboard</VHButton>
                  </Link>
                  <VHButton variant="primary" fullWidth onClick={() => { setMobileOpen(false); logout(); }}>Log Out</VHButton>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <VHButton variant="secondary" fullWidth>Log In</VHButton>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <VHButton variant="primary" fullWidth>Sign Up</VHButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
