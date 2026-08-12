import React from 'react';

export default function SellerDashboard() {
  return (
    <div className="pb-10">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase text-text-muted font-semibold">Wednesday, 13 August</p>
          <h1 className="font-display text-[26px] font-semibold my-1 text-text">Welcome back, Hill Loom Textiles</h1>
          <p className="m-0 text-text-muted text-[13.5px]">3 orders need packing today, and 2 products are almost out of stock.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2.5 rounded-lg hover-lift">View storefront</button>
          <button className="bg-primary text-primary-content border-none font-bold text-[13px] px-4 py-2.5 rounded-lg hover-lift flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FBEFDA]">
              <svg stroke="#B9791C" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-[#E6F2E9] text-[#1E7A3E]">+12%</span>
          </div>
          <div className="font-display text-[26px] font-semibold mt-3 mb-0.5 text-text">₹48,260</div>
          <div className="text-[12.5px] text-text-muted">Revenue this month</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E1EFEE]">
              <svg stroke="#095857" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/></svg>
            </div>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-[#E6F2E9] text-[#1E7A3E]">+5%</span>
          </div>
          <div className="font-display text-[26px] font-semibold mt-3 mb-0.5 text-text">186</div>
          <div className="text-[12.5px] text-text-muted">Orders this month</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-danger-bg">
              <svg stroke="#7A2A11" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            </div>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-danger-bg text-danger-content">3 due</span>
          </div>
          <div className="font-display text-[26px] font-semibold mt-3 mb-0.5 text-text">7</div>
          <div className="text-[12.5px] text-text-muted">Awaiting shipment</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E6F2E9]">
              <svg stroke="#1E7A3E" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M12 17.3l-6.2 3.6 1.6-7-5.4-4.7 7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7z"/></svg>
            </div>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-[#E6F2E9] text-[#1E7A3E]">4.7</span>
          </div>
          <div className="font-display text-[26px] font-semibold mt-3 mb-0.5 text-text">312</div>
          <div className="text-[12.5px] text-text-muted">Total reviews</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Sales, last 7 days</h3>
              <a href="#" className="text-[12.5px] font-bold text-accent-hover hover:underline">Full report →</a>
            </div>
            <div className="flex items-end gap-2.5 h-[150px] pt-2.5">
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#EFE3C9]" style={{height:'58px'}}></div><span className="text-[11px] text-text-muted font-semibold">Thu</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#EFE3C9]" style={{height:'82px'}}></div><span className="text-[11px] text-text-muted font-semibold">Fri</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#EFE3C9]" style={{height:'44px'}}></div><span className="text-[11px] text-text-muted font-semibold">Sat</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#EFE3C9]" style={{height:'96px'}}></div><span className="text-[11px] text-text-muted font-semibold">Sun</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#EFE3C9]" style={{height:'70px'}}></div><span className="text-[11px] text-text-muted font-semibold">Mon</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#EFE3C9]" style={{height:'64px'}}></div><span className="text-[11px] text-text-muted font-semibold">Tue</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-primary" style={{height:'110px'}}></div><span className="text-[11px] text-text-muted font-semibold">Wed</span></div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Recent orders</h3>
              <a href="#" className="text-[12.5px] font-bold text-accent-hover hover:underline">View all →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Order</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Item</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Buyer</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Amount</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: '#VH-8823', item: 'Handloom cotton saree', buyer: 'R. Nair, Kochi', amt: '₹1,499', status: 'Pack today', statusClass: 'bg-[#FDF0DA] text-[#B9791C]' },
                    { id: '#VH-8819', item: 'Linen shirt, tailored', buyer: 'A. Iyer, Chennai', amt: '₹899', status: 'Shipped', statusClass: 'bg-[#E1EFEE] text-[#095857]' },
                    { id: '#VH-8811', item: 'Kurta set, block print', buyer: 'S. Rao, Hyderabad', amt: '₹1,099', status: 'Delivered', statusClass: 'bg-[#E6F2E9] text-[#1E7A3E]' },
                    { id: '#VH-8804', item: 'Leather sling bag', buyer: 'P. Menon, Kozhikode', amt: '₹1,699', status: 'Cancelled', statusClass: 'bg-danger-bg text-danger-content' },
                    { id: '#VH-8798', item: 'Handloom cotton saree', buyer: 'D. Kumar, Bengaluru', amt: '₹1,499', status: 'Pack today', statusClass: 'bg-[#FDF0DA] text-[#B9791C]' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 pr-2 font-bold text-text">{row.id}</td>
                      <td className="py-3 px-2 text-text">{row.item}</td>
                      <td className="py-3 px-2 text-text-muted text-xs">{row.buyer}</td>
                      <td className="py-3 px-2 text-text">{row.amt}</td>
                      <td className="py-3 pl-2">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${row.statusClass}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Low stock</h3>
              <a href="#" className="text-[12.5px] font-bold text-accent-hover hover:underline">Manage →</a>
            </div>
            {[
              { img: 'vh-saree1', name: 'Handloom cotton saree', sub: 'Coimbatore weave', stock: '3 left' },
              { img: 'vh-bag1', name: 'Leather sling bag, tan', sub: 'Accessories', stock: '1 left' },
              { img: 'vh-shirt1', name: 'Linen shirt, tailored fit', sub: 'Menswear', stock: '5 left' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <img className="w-10 h-10 rounded-lg object-cover bg-background shrink-0" src={`https://picsum.photos/seed/${item.img}/80/80`} alt="" />
                <div className="flex-1 min-w-0">
                  <b className="block text-[12.5px] font-semibold text-text truncate">{item.name}</b>
                  <span className="text-[11.5px] text-text-muted">{item.sub}</span>
                </div>
                <span className="text-[11px] font-bold text-danger-content bg-danger-bg px-2 py-0.5 rounded-[5px] whitespace-nowrap">{item.stock}</span>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-[17px] font-semibold m-0 mb-3.5 text-text">To do</h3>
            {[
              'Pack & dispatch 3 orders before 6pm',
              'Reply to 2 buyer questions',
              'Restock 3 low-inventory items',
              'Confirm bank details for payout'
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0 text-[12.5px] text-text">
                <span className="w-2 h-2 rounded-full bg-danger shrink-0"></span>
                {task}
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Latest reviews</h3>
              <a href="#" className="text-[12.5px] font-bold text-accent-hover hover:underline">View all →</a>
            </div>
            {[
              { stars: '★★★★★', text: 'Beautiful weave, exactly as pictured. Fast shipping too.', sub: 'R. Nair · 2 days ago' },
              { stars: '★★★★☆', text: 'Good quality shirt, sizing ran slightly small.', sub: 'A. Iyer · 5 days ago' },
            ].map((rev, i) => (
              <div key={i} className="py-3 border-b border-border last:border-0 last:pb-0">
                <div className="text-[#B9791C] text-xs font-bold mb-1">{rev.stars}</div>
                <p className="m-0 mb-1 text-[12.5px] text-text-soft">{rev.text}</p>
                <span className="text-[11px] text-text-muted">{rev.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
