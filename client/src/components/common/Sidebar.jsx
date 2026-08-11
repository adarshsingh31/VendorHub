import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Sidebar — role-aware sidebar navigation.
 *
 * Props:
 *   role     — 'admin' | 'seller' | 'buyer'
 *   userName — display name for the logged-in user
 *   userRole — subtitle text (e.g. "Super Admin")
 */

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard', icon: 'dashboard', to: '/admin' },
    { label: 'Seller Applications', icon: 'assignment', to: '/admin/seller-applications' },
    { label: 'Users', icon: 'group', to: '/admin/users' },
    { label: 'Sellers', icon: 'store', to: '/admin/sellers' },
    { label: 'Products', icon: 'inventory_2', to: '/admin/products' },
    { label: 'Categories', icon: 'category', to: '/admin/categories' },
    { label: 'Orders', icon: 'shopping_cart', to: '/admin/orders' },
    { label: 'Reports', icon: 'bar_chart', to: '/admin/reports' },
  ],
  seller: [
    { label: 'Dashboard', icon: 'dashboard', to: '/seller' },
    { label: 'Products', icon: 'inventory_2', to: '/seller/products' },
    { label: 'Orders', icon: 'shopping_cart', to: '/seller/orders' },
    { label: 'Inventory', icon: 'shelves', to: '/seller/inventory' },
    { label: 'Earnings', icon: 'payments', to: '/seller/earnings' },
    { label: 'Analytics', icon: 'monitoring', to: '/seller/analytics' },
    { label: 'Reviews', icon: 'star', to: '/seller/reviews' },
    { label: 'Store Settings', icon: 'settings', to: '/seller/settings' },
  ],
  buyer: [
    { label: 'Home', icon: 'home', to: '/buyer' },
    { label: 'Browse Products', icon: 'search', to: '/buyer/products' },
    { label: 'My Cart', icon: 'shopping_cart', to: '/buyer/cart' },
    { label: 'My Orders', icon: 'receipt_long', to: '/buyer/orders' },
    { label: 'Wishlist', icon: 'favorite', to: '/buyer/wishlist' },
    { label: 'Addresses', icon: 'location_on', to: '/buyer/addresses' },
    { label: 'Become a Seller', icon: 'storefront', to: '/buyer/become-seller' },
  ],
};

const PANEL_LABELS = {
  admin: 'Admin Console',
  seller: 'Seller Panel',
  buyer: 'Buyer Portal',
};

export default function Sidebar({ role = 'buyer', userName = 'User', userInitial = 'U' }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navItems = NAV_ITEMS[role] || [];

  const isActive = (to) => {
    // exact match for dashboard root, prefix match for sub-routes
    if (to === `/${role}`) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex bg-primary text-on-primary h-screen w-64 fixed left-0 top-0 overflow-y-auto border-r border-white/10 flex-col py-4 z-20">
        {/* Logo */}
        <div className="px-6 pb-8 pt-2 flex items-center gap-3">
          <span
            className="material-symbols-outlined text-4xl text-secondary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            storefront
          </span>
          <div>
            <h1 className="text-xl font-bold text-on-primary tracking-tight">VendorHub</h1>
            <p className="text-xs text-on-primary/60">{PANEL_LABELS[role]}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                isActive(item.to)
                  ? 'bg-white/10 text-on-primary border-l-4 border-secondary-container'
                  : 'text-on-primary/70 hover:text-on-primary hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="mt-auto pt-4 border-t border-white/10 px-3 flex flex-col gap-1">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg mx-0">
            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-sm shrink-0">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-on-primary truncate">{userName}</p>
              <p className="text-xs text-secondary-container capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 text-on-primary/70 hover:text-on-primary hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 pb-safe bg-surface border-t border-outline/10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)]">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-xs font-semibold transition-colors ${
              isActive(item.to)
                ? 'text-primary'
                : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-[10px]">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
