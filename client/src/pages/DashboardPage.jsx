import { useState } from 'react'
import { Link } from 'react-router-dom'

const stats = [
  {
    label: 'Total Revenue',
    value: '$12,450.00',
    icon: 'payments',
    trend: '+14.2%',
    trendUp: true,
    sub: 'vs last month',
  },
  {
    label: 'Total Orders',
    value: '432',
    icon: 'shopping_bag',
    trend: '+5.4%',
    trendUp: true,
    sub: 'vs last month',
  },
  {
    label: 'Active Products',
    value: '128',
    icon: 'inventory_2',
    trend: null,
    sub: '12 items low on stock',
  },
  {
    label: 'Customer Rating',
    value: '4.8',
    valueSub: '/5.0',
    icon: 'star',
    trend: null,
    stars: true,
    sub: '(245 reviews)',
  },
]

const topProducts = [
  { icon: 'chair', name: 'Ergo Office Chair', sold: 142, revenue: '$2,840' },
  { icon: 'headphones', name: 'Pro Wireless Audio', sold: 98, revenue: '$1,950' },
  { icon: 'laptop_mac', name: 'Stand Pro Mount', sold: 75, revenue: '$975' },
]

const recentOrders = [
  { id: '#ORD-0921', customer: 'Sarah Jenkins', product: 'Ergo Office Chair', amount: '$199.00', status: 'Completed' },
  { id: '#ORD-0922', customer: 'Marcus Thorne', product: 'Pro Wireless Audio', amount: '$250.00', status: 'Pending' },
  { id: '#ORD-0923', customer: 'Elena Rodriguez', product: 'Stand Pro Mount', amount: '$85.00', status: 'Completed' },
  { id: '#ORD-0924', customer: 'David Chen', product: 'Mechanical Keyboard', amount: '$145.00', status: 'Cancelled' },
]

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'shopping_cart', label: 'Orders' },
  { icon: 'inventory_2', label: 'Products' },
  { icon: 'group', label: 'Customers' },
  { icon: 'analytics', label: 'Analytics' },
  { icon: 'settings', label: 'Settings' },
]

const statusStyle = {
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div className="h-full min-h-screen bg-[#f8f9ff] font-[Inter,sans-serif] text-[#0b1c30] antialiased flex overflow-hidden">

      {/* Sidebar */}
      <nav className="h-screen w-64 fixed left-0 top-0 pt-16 bg-white border-r border-[#c3c6d7]/20 flex flex-col gap-2 p-6 z-40 hidden md:flex shadow-[1px_0_0_0_rgba(0,0,0,0.04)]">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="material-symbols-outlined text-[#004ac6] text-3xl">hub</span>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#004ac6] leading-tight">VendorHub</span>
            <span className="text-xs text-[#434655] font-medium tracking-wide">Premium Merchant</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left w-full transition-all duration-200 ${
                activeNav === item.label
                  ? 'text-[#004ac6] bg-[#004ac6]/10 font-bold'
                  : 'text-[#434655] hover:text-[#0b1c30] hover:bg-[#dce9ff]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={activeNav === item.label ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-[#c3c6d7]/30 shadow-sm md:pl-64 transition-all duration-150">
        <div className="flex justify-between items-center h-16 px-6 max-w-[1280px] mx-auto w-full">
          {/* Mobile Brand */}
          <div className="md:hidden text-xl font-bold text-[#004ac6] flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span>VendorHub</span>
          </div>

          {/* Search */}
          <div className="hidden sm:flex items-center flex-1 max-w-md ml-0 relative group">
            <span className="material-symbols-outlined absolute left-3 text-[#434655] group-focus-within:text-[#004ac6] transition-colors text-[20px]">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-[#eff4ff] border border-[#e2e2e2] rounded-lg text-sm focus:outline-none focus:border-[#004ac6] focus:ring-4 focus:ring-[#004ac6]/10 transition-all placeholder:text-[#737686]"
              placeholder="Search orders, products..."
              type="text"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-[#434655] hover:bg-[#eff4ff] rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full" />
            </button>
            <button className="w-9 h-9 rounded-full overflow-hidden border border-[#c3c6d7]/30 hover:shadow-md transition-all">
              <img
                alt="Vendor profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsccUy14ZvgDmuWVCauyV6fJV62qzSTb6nJXwYmNhJWBjA_D85IWuIbNNUECFqeQlsbfRoecQcOZIoRErAmaSABE0DQsa6oMXEO8dJwch5xHORiqk03jih2sTS0M5m93_QLZnj5TtQ87Zn2tVKnMhT9tM4quCOlxUPfoI02Z5gbvflyigkyRC3SFjuga88mXN-cStvh9neVuANpWkdGqqre-82_3gto2wiUC81BpE2PIf97T7KPds-NTkQC3czOeRSOTI-yIAP-Xr5"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 pt-24 px-4 md:px-8 pb-12 overflow-y-auto w-full">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8">

          {/* Page Header */}
          <div>
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#0b1c30] tracking-tight">Dashboard Overview</h1>
            <p className="text-lg text-[#434655] mt-1">Welcome back. Here's what's happening with your store today.</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-2 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08),0_4px_6px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-150"
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-[#434655]">{stat.label}</span>
                  <div className="p-1.5 bg-[#eff4ff] rounded-lg text-[#004ac6]">
                    <span className="material-symbols-outlined text-sm">{stat.icon}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#0b1c30]">
                    {stat.value}
                    {stat.valueSub && <span className="text-lg text-[#434655] font-normal">{stat.valueSub}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-auto pt-2">
                  {stat.stars ? (
                    <>
                      {[1, 2, 3, 4].map((s) => (
                        <span key={s} className="material-symbols-outlined text-[16px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                      <span className="material-symbols-outlined text-[16px] text-yellow-500">star_half</span>
                      <span className="text-xs text-[#434655] ml-1">{stat.sub}</span>
                    </>
                  ) : stat.trend ? (
                    <>
                      <span className={`material-symbols-outlined text-[16px] ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trendUp ? 'trending_up' : 'trending_down'}
                      </span>
                      <span className={`text-xs font-semibold ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>{stat.trend}</span>
                      <span className="text-xs text-[#434655] ml-1">{stat.sub}</span>
                    </>
                  ) : (
                    <span className="text-xs text-[#434655]">{stat.sub}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)] border border-slate-100 p-4 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[#0b1c30]">Revenue Overview</h3>
                <select className="bg-[#eff4ff] border-none rounded-lg text-sm font-semibold text-[#0b1c30] py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-[#004ac6]/20 cursor-pointer">
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              {/* Simulated Chart */}
              <div className="relative w-full h-64 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                <div className="absolute inset-0 grid grid-rows-4 gap-0 pointer-events-none opacity-20">
                  {[1, 2, 3, 4].map((r) => <div key={r} className="border-b border-slate-300" />)}
                </div>
                {/* SVG line chart simulation */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 256" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#004ac6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#004ac6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,200 C60,180 120,140 180,120 C240,100 300,130 360,90 C420,50 480,70 600,40"
                    fill="none"
                    stroke="#004ac6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,200 C60,180 120,140 180,120 C240,100 300,130 360,90 C420,50 480,70 600,40 L600,256 L0,256 Z"
                    fill="url(#chartGrad)"
                  />
                </svg>
                {/* Month labels */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-around px-4">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                    <span key={m} className="text-xs text-[#737686]">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)] border border-slate-100 p-4 flex flex-col">
              <h3 className="text-lg font-semibold text-[#0b1c30] mb-6">Top Selling Products</h3>
              <div className="flex flex-col gap-4 flex-1">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6] shrink-0">
                      <span className="material-symbols-outlined text-sm">{product.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#0b1c30] truncate">{product.name}</div>
                      <div className="text-xs text-[#434655]">{product.sold} sold</div>
                    </div>
                    <div className="text-sm font-bold text-[#0b1c30] shrink-0">{product.revenue}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#0b1c30]">Recent Orders</h3>
              <button className="text-sm font-semibold text-[#004ac6] hover:text-[#2563eb] transition-colors">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff]/50 text-sm font-semibold text-[#434655] border-b border-slate-100">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#0b1c30] divide-y divide-slate-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#004ac6]">{order.id}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4">{order.product}</td>
                      <td className="py-3 px-4 font-medium">{order.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold ${statusStyle[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
