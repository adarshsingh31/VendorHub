import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import {
  buyerStats,
  buyerRecentOrders,
  buyerCategories,
  buyerRecommendedProducts,
} from '../../data/mockData';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const userName = user?.name || 'Buyer';
  const userInitial = userName.charAt(0).toUpperCase();
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex">
      {/* Sidebar */}
      <Sidebar role="buyer" userName={userName} userInitial={userInitial} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-surface h-16 shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-outline/10 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl md:hidden">storefront</span>
            <div className="hidden md:block">
              <h2 className="text-lg font-bold text-on-surface">My Dashboard</h2>
              <p className="text-xs text-on-surface-variant">Welcome back, {userName}! 👋</p>
            </div>
          </div>
          {/* Search bar — hidden on small screens, shown md+ */}
          <div className="relative hidden md:block w-64 lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-surface-container-low border border-outline/20 rounded-full pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border border-surface" />
            </button>
            <Link to="/buyer/cart" className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
              {buyerStats.cartItems > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center">
                  {buyerStats.cartItems}
                </span>
              )}
            </Link>
            <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-on-surface border border-outline/20">
              {userInitial}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 pb-24 md:pb-8 space-y-6">
          {/* Mobile title */}
          <div className="md:hidden">
            <h2 className="text-2xl font-bold text-on-surface">My Dashboard</h2>
            <p className="text-sm text-on-surface-variant">Welcome back, {userName}! 👋</p>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-surface-container-low border border-outline/20 rounded-full pl-10 pr-4 py-2.5 text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* ── Stats Row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { icon: 'receipt_long', label: 'Total Orders', value: buyerStats.totalOrders, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
              { icon: 'favorite', label: 'Wishlist', value: buyerStats.wishlistItems, iconBg: 'bg-[#FFEBEE]', iconColor: 'text-[#C62828]' },
              { icon: 'shopping_cart', label: 'Cart Items', value: buyerStats.cartItems, iconBg: 'bg-[#FFF3E0]', iconColor: 'text-[#E65100]' },
              { icon: 'currency_rupee', label: 'Total Spent', value: buyerStats.totalSpent, iconBg: 'bg-[#F3E5F5]', iconColor: 'text-[#7B1FA2]' },
              { icon: 'location_on', label: 'Saved Addresses', value: buyerStats.savedAddresses, iconBg: 'bg-[#E8F5E9]', iconColor: 'text-[#2E7D32]' },
            ].map((stat) => (
              <div key={stat.label} className="paper-card rounded-xl p-3 md:p-4 flex items-center gap-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-on-surface-variant truncate">{stat.label}</p>
                  <p className="text-lg font-bold text-on-surface leading-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Categories ────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-on-surface">Browse Categories</h3>
              <Link to="/buyer/products" className="text-primary text-sm font-semibold hover:underline flex items-center gap-0.5">
                View All <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {buyerCategories.map((cat) => (
                <Link
                  key={cat.name}
                  to="/buyer/products"
                  className="paper-card rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:scale-[1.02] transition-transform"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: cat.bg, color: cat.color }}
                  >
                    <span className="material-symbols-outlined">{cat.icon}</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface">{cat.name}</p>
                  <p className="text-xs text-on-surface-variant">{cat.count}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Recommended Products ───────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-on-surface">Recommended For You</h3>
              <Link to="/buyer/products" className="text-primary text-sm font-semibold hover:underline flex items-center gap-0.5">
                View All <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {buyerRecommendedProducts.map((product) => (
                <div key={product.id} className="paper-card rounded-xl overflow-hidden hover:scale-[1.01] transition-transform">
                  {/* Image placeholder */}
                  <div className="aspect-square bg-surface-container-low flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">image</span>
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[16px]">favorite_border</span>
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-on-surface line-clamp-2 leading-snug">{product.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{product.seller}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-secondary-container text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-semibold text-on-surface">{product.rating}</span>
                      <span className="text-xs text-on-surface-variant">({product.reviews})</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-bold text-on-surface">{product.price}</span>
                      <span className="text-xs text-on-surface-variant line-through">{product.originalPrice}</span>
                    </div>
                    <button className="mt-2 w-full bg-primary text-on-primary text-xs font-bold py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recent Orders ──────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-on-surface">Recent Orders</h3>
              <Link to="/buyer/orders" className="text-primary text-sm font-semibold hover:underline flex items-center gap-0.5">
                View All <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            <div className="paper-card rounded-xl overflow-hidden">
              <div className="divide-y divide-on-surface/5">
                {buyerRecentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-low flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-on-surface-variant text-xl">package_2</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{order.id}</p>
                        <p className="text-xs text-on-surface-variant">{order.product}</p>
                        <p className="text-xs text-on-surface-variant/70">{order.seller}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-surface">{order.amount}</p>
                      <p className="text-xs text-on-surface-variant mb-1">{order.date}</p>
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Become a Seller Promo ──────────────────────────────── */}
          <div className="paper-card rounded-xl p-6 bg-gradient-to-r from-primary to-primary/80 text-on-primary flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Want to sell on VendorHub?</h3>
              <p className="text-sm text-on-primary/80">Join thousands of local sellers. Set up your shop in minutes.</p>
            </div>
            <Link
              to="/buyer/become-seller"
              className="shrink-0 bg-on-primary text-primary font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              Become a Seller
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
