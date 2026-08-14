import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

export default function Sidebar({ 
  role = 'buyer', 
  userName = 'User', 
  userInitial = 'U',
  isCollapsed = false,
  toggleSidebar,
  isMobileOpen,
  toggleMobileMenu
}) {
  const { logout } = useAuth();
  const location = useLocation();
  const navItems = NAV_ITEMS[role] || [];

  const isActive = (to) => {
    if (to === `/${role}`) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const sidebarWidth = isCollapsed ? 'md:w-[72px]' : 'md:w-[240px]';
  const mobileTransform = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      <aside 
        className={`fixed md:sticky left-0 top-0 h-screen bg-surface border-r border-border flex flex-col py-4 z-40 transition-all duration-300 w-[240px] ${sidebarWidth} ${mobileTransform} md:translate-x-0 shrink-0`}
      >
        {/* Mobile Close Button */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden absolute right-4 top-4 text-text-muted hover:text-text p-1"
          title="Close navigation menu"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Logo */}
        <div className={`px-4 pb-6 pt-2 flex items-center shrink-0 ${isCollapsed ? 'md:justify-center' : 'gap-3'}`}>
          <span className="material-symbols-outlined text-3xl text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            storefront
          </span>
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-lg font-display font-bold text-text tracking-tight truncate">Vendor<span className="text-primary">Hub</span></h1>
            <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider truncate">{PANEL_LABELS[role]}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto overflow-x-hidden no-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.label : undefined}
                onClick={() => {
                  if (isMobileOpen) toggleMobileMenu();
                }}
                className={`flex items-center rounded-lg text-sm font-semibold transition-all duration-200 relative group ${
                  isCollapsed ? 'md:justify-center md:gap-0 p-3' : 'gap-3 px-3 py-2.5'
                } ${
                  active
                    ? 'bg-primary text-primary-content shadow-sm'
                    : 'text-text-soft hover:text-text hover:bg-surface-sunken'
                }`}
              >
                <span className={`material-symbols-outlined shrink-0 ${active ? 'text-primary-content' : 'text-text-muted'} ${isCollapsed ? 'text-[22px]' : 'text-[20px]'}`}>
                  {item.icon}
                </span>
                <span className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0 md:ml-0' : 'w-auto opacity-100 ml-0'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="mt-auto pt-4 border-t border-border px-3 flex flex-col gap-2 shrink-0">
          <div className={`flex items-center rounded-lg transition-all duration-300 bg-surface-sunken ${isCollapsed ? 'md:justify-center p-2' : 'gap-3 px-3 py-2'}`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-hover flex items-center justify-center font-bold text-sm shrink-0" title={userName}>
              {userInitial}
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
              <p className="text-[13px] font-semibold text-text truncate">{userName}</p>
              <p className="text-[11px] text-text-muted capitalize truncate">{role}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex items-center rounded-lg text-sm font-semibold transition-all duration-150 text-text-soft hover:text-danger hover:bg-danger-bg ${
              isCollapsed ? 'md:justify-center md:gap-0 p-3' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
            <span className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
