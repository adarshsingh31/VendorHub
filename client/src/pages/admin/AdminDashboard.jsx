import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import SellerApplicationCard from '../../components/admin/SellerApplicationCard';
import ActivityFeed from '../../components/admin/ActivityFeed';
import {
  adminStats,
  adminSellerApplications,
  adminRecentOrders,
  adminTopCategories,
  adminActivity,
} from '../../data/mockData';

export default function AdminDashboard() {
  const { user } = useAuth();
  const userName = user?.name || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="font-body-md text-on-surface min-h-screen bg-surface flex">
      {/* Sidebar */}
      <Sidebar role="admin" userName={userName} userInitial={userInitial} />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {/* Top header bar */}
        <header className="bg-surface h-16 shrink-0 flex items-center justify-between px-6 border-b border-outline/10 sticky top-0 z-10">
          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-on-surface">Dashboard</h2>
            <p className="text-sm text-on-surface-variant">Welcome back, {userName}! 👋</p>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
            <span className="text-lg font-bold text-primary">VendorHub</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-56 lg:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                className="w-full bg-transparent border-b border-on-surface/20 focus:border-primary outline-none pl-9 pr-4 py-1.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-colors"
                placeholder="Search anything..."
                type="text"
              />
            </div>
            <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border border-surface" />
            </button>
            <div className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden shrink-0 border border-outline/20 flex items-center justify-center font-bold text-sm text-on-surface">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page body */}
        <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-20 md:pb-8">
          {/* Mobile page title */}
          <div className="md:hidden">
            <h2 className="text-2xl font-bold text-on-surface">Dashboard</h2>
            <p className="text-sm text-on-surface-variant">Welcome back, {userName}! 👋</p>
          </div>

          {/* ── Stats Row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon="group" label="Total Users" value={adminStats.totalUsers.toLocaleString()} trend="12.5% from last month" iconBg="bg-primary/10" iconColor="text-primary" />
            <StatCard icon="store" label="Total Sellers" value={adminStats.totalSellers.toLocaleString()} trend="8.2% from last month" iconBg="bg-tertiary-fixed-dim/20" iconColor="text-tertiary-container" />
            <StatCard icon="local_mall" label="Total Products" value={adminStats.totalProducts.toLocaleString()} trend="15.3% from last month" iconBg="bg-[#E3F2FD]" iconColor="text-[#1565C0]" />
            <StatCard icon="shopping_cart" label="Total Orders" value={adminStats.totalOrders.toLocaleString()} trend="10.7% from last month" iconBg="bg-[#FFF3E0]" iconColor="text-[#E65100]" />
            <StatCard icon="currency_rupee" label="Total Revenue" value={adminStats.totalRevenue} trend="18.6% from last month" iconBg="bg-[#F3E5F5]" iconColor="text-[#7B1FA2]" className="col-span-2 md:col-span-1" />
          </div>

          {/* ── Middle Grid ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Seller Applications */}
            <div className="xl:col-span-2 paper-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-on-surface">Seller Applications</h3>
                  <span className="bg-tertiary-fixed-dim/20 text-tertiary-container text-xs px-2 py-0.5 rounded-full">
                    {adminSellerApplications.length}
                  </span>
                </div>
                <a href="/admin/seller-applications" className="text-primary text-sm font-bold flex items-center gap-0.5 hover:underline">
                  View All <span className="material-symbols-outlined text-sm">chevron_right</span>
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {adminSellerApplications.map((app) => (
                      <SellerApplicationCard
                        key={app.id}
                        {...app}
                        onApprove={() => console.log('Approve', app.id)}
                        onReject={() => console.log('Reject', app.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overview Chart */}
            <div className="paper-card rounded-xl p-6 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-on-surface">
                  Overview <span className="text-sm font-normal text-on-surface-variant">(This Month)</span>
                </h3>
                <a href="/admin/reports" className="text-primary text-sm font-bold hover:underline">View Report</a>
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-4 mb-4">
                {[['#5E35B1','Orders'],['#2E7D32','Users'],['#F57C00','Sellers']].map(([c,l]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded-full" style={{ backgroundColor: c }} />
                    <span className="text-xs text-on-surface-variant">{l}</span>
                  </div>
                ))}
              </div>
              {/* Chart mockup */}
              <div className="flex-1 relative border-l border-b border-outline/10 ml-6 pb-6 min-h-[180px]">
                <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-xs text-on-surface-variant/70 text-right pr-2">
                  {['1K','800','600','400','200','0'].map(v => <span key={v}>{v}</span>)}
                </div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline fill="none" points="0,40 10,38 20,35 30,30 40,32 50,25 60,30 70,20 80,25 90,22 100,20" stroke="#5E35B1" strokeWidth="1" />
                  <polyline fill="none" points="0,60 10,58 20,58 30,52 40,55 50,50 60,50 70,45 80,48 90,45 100,42" stroke="#2E7D32" strokeWidth="1" />
                  <polyline fill="none" points="0,80 10,78 20,78 30,75 40,78 50,75 60,72 70,75 80,72 90,70 100,68" stroke="#F57C00" strokeWidth="1" />
                </svg>
                <div className="absolute -bottom-6 left-0 w-full flex justify-between text-xs text-on-surface-variant/70 px-2">
                  {['1 May','8 May','15 May','22 May','29 May'].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Grid ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="paper-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-on-surface">Recent Orders</h3>
                <a href="/admin/orders" className="text-primary text-sm font-bold flex items-center hover:underline">
                  View All <span className="material-symbols-outlined text-sm">chevron_right</span>
                </a>
              </div>
              <div className="flex flex-col gap-4">
                {adminRecentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between pb-3 border-b border-on-surface/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded border border-outline/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-on-surface-variant text-2xl">{order.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">Order {order.id}</p>
                        <p className="text-xs text-on-surface-variant">{order.product}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-surface">{order.amount}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                        style={{ backgroundColor: order.statusColor, color: order.statusText }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div className="paper-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-on-surface">Top Categories</h3>
                <a href="/admin/categories" className="text-primary text-sm font-bold flex items-center hover:underline">
                  View All <span className="material-symbols-outlined text-sm">chevron_right</span>
                </a>
              </div>
              <div className="flex flex-col gap-5 mt-2">
                {adminTopCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bg, color: cat.color }}>
                      <span className="material-symbols-outlined">{cat.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-bold text-on-surface">{cat.name}</p>
                        <p className="text-sm font-bold text-on-surface">{cat.percent}%</p>
                      </div>
                      <div className="w-full bg-outline/10 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${cat.percent}%`, backgroundColor: cat.color }} />
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">{cat.products.toLocaleString()} Products</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="paper-card rounded-xl p-6 md:col-span-2 xl:col-span-1">
              <h3 className="text-base font-bold text-on-surface mb-4">Recent Activity</h3>
              <ActivityFeed activities={adminActivity} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
