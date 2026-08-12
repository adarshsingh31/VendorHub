import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="pb-10">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase text-text-muted font-semibold">Wednesday, 13 August</p>
          <h1 className="font-display text-[26px] font-semibold my-1 text-text">Platform overview</h1>
          <p className="m-0 text-text-muted text-[13.5px]">6 sellers awaiting approval, 3 disputes need a decision.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2.5 rounded-lg hover-lift">Export report</button>
          <button className="bg-text text-white border-none font-bold text-[13px] px-4 py-2.5 rounded-lg hover-lift">Review approvals</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FBEFDA]">
              <svg stroke="#B9791C" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-[#E6F2E9] text-[#1E7A3E]">+9%</span>
          </div>
          <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text">₹18.4L</div>
          <div className="text-xs text-text-muted">GMV this month</div>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E1EFEE]">
              <svg stroke="#095857" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/></svg>
            </div>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-[#E6F2E9] text-[#1E7A3E]">+14%</span>
          </div>
          <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text">4,812</div>
          <div className="text-xs text-text-muted">Orders this month</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E6F2E9]">
              <svg stroke="#1E7A3E" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/></svg>
            </div>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-[#E6F2E9] text-[#1E7A3E]">+3</span>
          </div>
          <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text">248</div>
          <div className="text-xs text-text-muted">Active sellers</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-danger-bg">
              <svg stroke="#7A2A11" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
            </div>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-danger-bg text-danger-content">3 open</span>
          </div>
          <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text">3</div>
          <div className="text-xs text-text-muted">Open disputes</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FDF0DA]">
              <svg stroke="#B9791C" viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.2px] fill-none"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-[5px] bg-[#FDF0DA] text-[#B9791C]">Fri payout</span>
          </div>
          <div className="font-display text-[23px] font-semibold mt-3 mb-0.5 text-text">₹6.1L</div>
          <div className="text-xs text-text-muted">Pending payouts</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Platform GMV, last 7 days</h3>
              <a href="#" className="text-[12.5px] font-bold text-accent-hover hover:underline">Full report →</a>
            </div>
            <div className="flex items-end gap-2.5 h-[150px] pt-2.5">
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#DCEAE9]" style={{height:'70px'}}></div><span className="text-[11px] text-text-muted font-semibold">Thu</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#DCEAE9]" style={{height:'92px'}}></div><span className="text-[11px] text-text-muted font-semibold">Fri</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#DCEAE9]" style={{height:'60px'}}></div><span className="text-[11px] text-text-muted font-semibold">Sat</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#DCEAE9]" style={{height:'104px'}}></div><span className="text-[11px] text-text-muted font-semibold">Sun</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#DCEAE9]" style={{height:'84px'}}></div><span className="text-[11px] text-text-muted font-semibold">Mon</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-[#DCEAE9]" style={{height:'76px'}}></div><span className="text-[11px] text-text-muted font-semibold">Tue</span></div>
              <div className="flex-1 flex flex-col items-center gap-1.5"><div className="w-full rounded-t-[5px] bg-accent" style={{height:'120px'}}></div><span className="text-[11px] text-text-muted font-semibold">Wed</span></div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Seller approvals</h3>
              <a href="#" className="text-[12.5px] font-bold text-accent-hover hover:underline">View all →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Stall</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Category</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Submitted</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Status</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border"></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { init: 'RC', name: 'Riverside Ceramics', cat: 'Home & kitchen', type: 'Home', time: '2 days ago', status: 'Pending', statusClass: 'bg-[#FDF0DA] text-[#B9791C]' },
                    { init: 'NK', name: 'Nilgiri Kitchens', cat: 'Grocery', type: 'Grocery', time: '3 days ago', status: 'Pending', statusClass: 'bg-[#FDF0DA] text-[#B9791C]' },
                    { init: 'SB', name: 'Sundara Beauty Co.', cat: 'Beauty', type: 'Beauty', time: '4 days ago', status: 'In review', statusClass: 'bg-[#E1EFEE] text-[#095857]' },
                    { init: 'HL', name: 'Hill Loom Textiles', cat: 'Fashion', type: 'Fashion', time: '1 week ago', status: 'Approved', statusClass: 'bg-[#E6F2E9] text-[#1E7A3E]' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[30px] h-[30px] rounded-lg bg-[#FBEFDA] text-[#B9791C] font-bold text-[11.5px] flex items-center justify-center shrink-0">{row.init}</div>
                          <div>
                            <b className="block text-[12.5px] font-semibold text-text">{row.name}</b>
                            <span className="text-[11.5px] text-text-muted">{row.cat}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-text">{row.type}</td>
                      <td className="py-3 px-2 text-text">{row.time}</td>
                      <td className="py-3 px-2">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${row.statusClass}`}>{row.status}</span>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        {row.status === 'Approved' ? (
                          <div className="flex gap-1.5 justify-end">
                            <button className="border border-border bg-white rounded-md px-2.5 py-1 text-[11.5px] font-semibold text-text-soft" disabled>Live</button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 justify-end">
                            <button className="border border-[#BFE0DE] text-accent-hover bg-white rounded-md px-2.5 py-1 text-[11.5px] font-semibold hover:bg-accent/10">Approve</button>
                            <button className="border border-[#F3C7B8] text-danger-content bg-white rounded-md px-2.5 py-1 text-[11.5px] font-semibold hover:bg-danger/10">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Flagged listings</h3>
              <a href="#" className="text-[12.5px] font-bold text-accent-hover hover:underline">View all →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Listing</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Stall</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Reason</th>
                    <th className="text-left text-text-muted font-semibold text-[11.5px] uppercase tracking-wider pb-2.5 border-b border-border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border last:border-0">
                    <td className="py-3 pr-2 font-medium text-text">"Genuine" leather wallet</td>
                    <td className="py-3 px-2 text-text-muted">Metro Trends</td>
                    <td className="py-3 px-2 text-text-muted">Suspected counterfeit claim</td>
                    <td className="py-3 pl-2"><span className="bg-danger-bg text-danger-content text-[11px] font-bold px-2.5 py-1 rounded-full">Flagged</span></td>
                  </tr>
                  <tr className="border-b border-border last:border-0">
                    <td className="py-3 pr-2 font-medium text-text">Wireless earbuds pro max</td>
                    <td className="py-3 px-2 text-text-muted">GadgetBazaar</td>
                    <td className="py-3 px-2 text-text-muted">Misleading title</td>
                    <td className="py-3 pl-2"><span className="bg-[#E1EFEE] text-accent-hover text-[11px] font-bold px-2.5 py-1 rounded-full">In review</span></td>
                  </tr>
                  <tr className="border-b border-border last:border-0">
                    <td className="py-3 pr-2 font-medium text-text">Herbal weight loss tea</td>
                    <td className="py-3 px-2 text-text-muted">Green Leaf Co.</td>
                    <td className="py-3 px-2 text-text-muted">Unverified health claim</td>
                    <td className="py-3 pl-2"><span className="bg-danger-bg text-danger-content text-[11px] font-bold px-2.5 py-1 rounded-full">Flagged</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-[17px] font-semibold m-0 mb-3.5 text-text">GMV by category</h3>
            {[
              { name: 'Fashion', w: '82%', pct: '32%' },
              { name: 'Electronics', w: '64%', pct: '25%' },
              { name: 'Home', w: '46%', pct: '18%' },
              { name: 'Beauty', w: '31%', pct: '12%' },
              { name: 'Grocery', w: '23%', pct: '9%' },
              { name: 'Other', w: '10%', pct: '4%' },
            ].map(cat => (
              <div key={cat.name} className="flex items-center gap-2.5 py-2 text-[12.5px]">
                <span className="w-[92px] shrink-0 font-semibold text-text">{cat.name}</span>
                <div className="flex-1 h-[7px] rounded bg-background overflow-hidden">
                  <div className="h-full rounded bg-accent" style={{width: cat.w}}></div>
                </div>
                <span className="w-[36px] text-right text-text-muted font-semibold">{cat.pct}</span>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-[17px] font-semibold m-0 text-text">Top sellers</h3>
              <a href="#" className="text-[12.5px] font-bold text-accent-hover hover:underline">View all →</a>
            </div>
            {[
              { init: 'HL', name: 'Hill Loom Textiles', info: '₹2.1L GMV · 4.7★' },
              { init: 'GB', name: 'GadgetBazaar', info: '₹1.8L GMV · 4.3★' },
              { init: 'MT', name: 'Metro Trends', info: '₹1.4L GMV · 4.0★' },
              { init: 'GL', name: 'Green Leaf Co.', info: '₹0.9L GMV · 3.9★' },
            ].map(seller => (
              <div key={seller.init} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <div className="w-[30px] h-[30px] rounded-lg bg-[#FBEFDA] text-[#B9791C] font-bold text-[11.5px] flex items-center justify-center shrink-0">{seller.init}</div>
                <div className="flex-1 min-w-0">
                  <b className="block text-[12.5px] font-semibold text-text truncate">{seller.name}</b>
                  <span className="text-[11.5px] text-text-muted">{seller.info}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display text-[17px] font-semibold m-0 mb-3.5 text-text">Needs attention</h3>
            {[
              { color: 'bg-danger', text: '3 disputes waiting on a ruling' },
              { color: 'bg-danger', text: '2 flagged listings need review' },
              { color: 'bg-warning', text: '6 sellers pending approval' },
              { color: 'bg-warning', text: 'Friday payout batch not yet confirmed' },
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0 text-[12.5px] text-text">
                <span className={`w-2 h-2 rounded-full shrink-0 ${task.color}`}></span>
                {task.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
