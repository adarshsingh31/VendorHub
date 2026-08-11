import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import SalesChart from '../../components/seller/SalesChart';
import {
  sellerStats,
  sellerEarnings,
  sellerRecentOrders,
  sellerTopProducts,
} from '../../data/mockData';

export default function SellerDashboard() {
  const { user } = useAuth();
  const userName = user?.name || 'Seller';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F4F1EA] font-[Manrope,sans-serif] text-on-surface flex">
      {/* Sidebar */}
      <Sidebar role="seller" userName={userName} userInitial={userInitial} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {/* Top Bar — desktop only */}
        <header className="bg-surface border-b border-outline-variant hidden md:flex justify-between items-center w-full px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-primary">Seller Dashboard</h1>
              <p className="text-sm text-on-surface-variant">
                Welcome back, <span className="text-primary font-bold">{userName}</span> 👋
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-primary">
              <button className="material-symbols-outlined hover:text-primary-container transition-colors relative">
                notifications
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full" />
              </button>
              <button className="material-symbols-outlined hover:text-primary-container transition-colors">help</button>
            </div>
            <div className="flex items-center gap-3 border-l border-outline-variant pl-6">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                {userInitial}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{userName}</p>
                <p className="text-xs text-on-surface-variant flex items-center">
                  Seller <span className="material-symbols-outlined text-[16px] ml-1">expand_more</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6">
          {/* Mobile Header */}
          <div className="md:hidden flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary">Seller Dashboard</h1>
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {userInitial}
            </div>
          </div>

          {/* ── KPI Cards ─────────────────────────────────────────── */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-variant flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-0.5">Total Sales</p>
                <h3 className="text-base font-bold text-on-surface">{sellerStats.totalSales}</h3>
                <p className="text-xs text-primary mt-0.5 flex items-center">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span> 18.6%
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-variant flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-0.5">Total Orders</p>
                <h3 className="text-base font-bold text-on-surface">{sellerStats.totalOrders}</h3>
                <p className="text-xs text-primary mt-0.5 flex items-center">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span> 12.4%
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-variant flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>deployed_code</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-0.5">Total Products</p>
                <h3 className="text-base font-bold text-on-surface">{sellerStats.totalProducts}</h3>
                <p className="text-xs text-primary mt-0.5 flex items-center">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span> 5 new
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-variant flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-0.5">Store Views</p>
                <h3 className="text-base font-bold text-on-surface">{sellerStats.storeViews}</h3>
                <p className="text-xs text-primary mt-0.5 flex items-center">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span> 20.3%
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-variant flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-0.5">Store Rating</p>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-1">
                  {sellerStats.storeRating}
                  <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </h3>
                <p className="text-xs text-outline mt-0.5">({sellerStats.reviewCount} reviews)</p>
              </div>
            </div>
          </section>

          {/* ── Main Dashboard Grid ────────────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left — Chart + Earnings */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Sales Overview */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-surface-variant flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-on-surface">Sales Overview</h3>
                  <div className="border border-outline-variant rounded px-3 py-1 text-xs text-on-surface-variant flex items-center cursor-pointer">
                    This Month <span className="material-symbols-outlined text-[14px] ml-1">expand_more</span>
                  </div>
                </div>
                <SalesChart />
              </div>

              {/* Earnings Overview */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-surface-variant flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-on-surface mb-4">Earnings Overview</h3>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                      </div>
                      <div>
                        <p className="text-xs text-outline">Available Balance</p>
                        <p className="text-base font-bold text-on-surface">{sellerEarnings.availableBalance}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
                      </div>
                      <div>
                        <p className="text-xs text-outline">Pending Balance</p>
                        <p className="text-base font-bold text-on-surface">{sellerEarnings.pendingBalance}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="bg-primary text-on-primary font-bold text-sm py-2 px-5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                  Withdraw Earnings <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Recent Orders */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-variant">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-on-surface">Recent Orders</h3>
                  <a href="/seller/orders" className="text-xs text-primary hover:underline">View All</a>
                </div>
                <div className="space-y-4">
                  {sellerRecentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between pb-3 border-b border-surface-variant">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.img}
                          alt={order.id}
                          className="w-10 h-10 rounded bg-surface-variant object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{order.id}</p>
                          <p className="text-xs text-outline">{order.buyer} • {order.items} {order.items === 1 ? 'Item' : 'Items'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-outline mb-1">{order.date}</p>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-variant">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-on-surface">Top Selling Products</h3>
                  <a href="/seller/products" className="text-xs text-primary hover:underline">View All</a>
                </div>
                <div className="space-y-4">
                  {sellerTopProducts.map((product) => (
                    <div key={product.name} className="flex items-center justify-between pb-3 border-b border-surface-variant">
                      <div className="flex items-center gap-3 w-1/2">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-8 h-8 rounded bg-surface-variant object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold text-on-surface truncate">{product.name}</p>
                          <p className="text-[10px] text-outline">{product.sold} Sold</p>
                        </div>
                      </div>
                      <div className="w-1/4 px-2">
                        <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${product.soldPercent}%` }} />
                        </div>
                      </div>
                      <div className="w-1/4 text-right">
                        <p className="text-xs font-bold text-on-surface">{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
