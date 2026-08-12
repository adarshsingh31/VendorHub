import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

const socialIcons = {
  Instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  Twitter: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.6L4.4 22H1.3l8.1-9.3L1 2h7l4.9 6L18.9 2Zm-1.2 18.2h1.9L7.4 3.7H5.4L17.7 20.2Z" />
    </svg>
  ),
  Facebook: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.5V21h3.1Z" />
    </svg>
  ),
  Linkedin: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.9 8.4H3.6V20h3.3V8.4ZM5.3 3.5a1.9 1.9 0 1 0 0 3.9 1.9 1.9 0 0 0 0-3.9ZM20.4 20h-3.3v-6.1c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.9 1.3-.1.2-.1.5-.1.8V20h-3.3s.1-10.6 0-11.6h3.3v1.6c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5V20Z" />
    </svg>
  ),
}

const columns = [
  {
    title: 'Platform',
    links: ['Explore Products', 'Categories', 'How It Works'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact', 'Privacy Policy', 'Terms'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Refund Policy', 'Order Tracking'],
  },
]

const socials = [socialIcons.Instagram, socialIcons.Twitter, socialIcons.Facebook, socialIcons.Linkedin]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-soft">
      <div className="container-page grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content">
              <ShoppingBag size={18} strokeWidth={2.3} />
            </span>
            <span className="font-display text-lg font-bold text-text">Vendor<span className="text-primary">Hub</span></span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
            Connecting local businesses with modern shoppers.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-primary hover:bg-surface hover:text-primary"
              >
                <Icon width={16} height={16} />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm font-semibold text-text">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-text-muted transition-colors hover:text-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-xs text-text-muted">© 2026 VendorHub. All rights reserved.</p>
          <p className="text-xs text-text-muted">Made for local commerce, everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
