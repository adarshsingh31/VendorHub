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

  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[240px]';
  const mobileTransform = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      {/* Desktop & Mobile Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col py-4 z-40 transition-all duration-300 md:translate-x-0 ${sidebarWidth} ${mobileTransform}`}
      >
        {/* Toggle Button (Desktop Only) */}
        <button 
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-surface border border-border rounded-full items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors shadow-soft z-50"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined text-[14px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Mobile Close Button */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden absolute right-4 top-4 text-text-muted hover:text-text p-1"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Logo */}
        <div className={`px-4 pb-6 pt-2 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            storefront
          </span>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-display font-bold text-text tracking-tight truncate">Vendor<span className="text-primary">Hub</span></h1>
              <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider truncate">{PANEL_LABELS[role]}</p>
            </div>
          )}
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
                className={`flex items-center rounded-lg text-sm font-semibold transition-colors duration-150 relative group ${
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                } ${
                  active
                    ? 'bg-primary/10 text-primary-hover'
                    : 'text-text-soft hover:text-text hover:bg-surface-sunken'
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />}
                <span className={`material-symbols-outlined ${active ? 'text-primary' : ''} ${isCollapsed ? 'text-[22px]' : 'text-[20px]'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="mt-auto pt-4 border-t border-border px-3 flex flex-col gap-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-3 py-2 bg-surface-sunken rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-hover flex items-center justify-center font-bold text-sm shrink-0">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-semibold text-text truncate">{userName}</p>
                <p className="text-[11px] text-text-muted capitalize truncate">{role}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/20 text-primary-hover flex items-center justify-center font-bold text-sm" title={userName}>
              {userInitial}
            </div>
          )}
          
          <button
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex items-center rounded-lg text-sm font-semibold transition-colors text-text-soft hover:text-danger hover:bg-danger-bg ${
              isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
