import React, { useState, useEffect, useMemo } from 'react';

const PRODUCTS = [
  {id:1,name:"Wireless earbuds, active noise cancelling",cat:"Electronics",price:2399,mrp:4999,rating:4.3,seed:"vh-ear1"},
  {id:2,name:"Smartwatch with AMOLED display",cat:"Electronics",price:3499,mrp:6999,rating:4.1,seed:"vh-watch1"},
  {id:3,name:"20000mAh fast-charge power bank",cat:"Electronics",price:1199,mrp:1999,rating:4.5,seed:"vh-power1"},
  {id:4,name:"Bluetooth party speaker, 12hr battery",cat:"Electronics",price:1899,mrp:3499,rating:4.2,seed:"vh-speak1"},
  {id:5,name:"Handloom cotton saree, Coimbatore weave",cat:"Fashion",price:1499,mrp:2999,rating:4.6,seed:"vh-saree1"},
  {id:6,name:"Men's linen shirt, tailored fit",cat:"Fashion",price:899,mrp:1799,rating:4.0,seed:"vh-shirt1"},
  {id:7,name:"Women's kurta set, block print",cat:"Fashion",price:1099,mrp:2199,rating:4.4,seed:"vh-kurta1"},
  {id:8,name:"Leather sling bag, tan",cat:"Fashion",price:1699,mrp:2999,rating:4.3,seed:"vh-bag1"},
  {id:9,name:"6-piece nonstick cookware set",cat:"Home",price:2199,mrp:4499,rating:4.2,seed:"vh-cook1"},
  {id:10,name:"Cotton bedsheet set, king size",cat:"Home",price:999,mrp:1999,rating:4.1,seed:"vh-bed1"},
  {id:11,name:"Brass table lamp, hand finished",cat:"Home",price:1299,mrp:2399,rating:4.5,seed:"vh-lamp1"},
  {id:12,name:"Stoneware dinner set, 16 pieces",cat:"Home",price:1899,mrp:3299,rating:4.3,seed:"vh-dinner1"},
  {id:13,name:"Vitamin C brightening serum",cat:"Beauty",price:449,mrp:799,rating:4.4,seed:"vh-serum1"},
  {id:14,name:"Argan hair oil, 200ml",cat:"Beauty",price:349,mrp:699,rating:4.2,seed:"vh-oil1"},
  {id:15,name:"Matte lipstick trio pack",cat:"Beauty",price:599,mrp:1099,rating:4.0,seed:"vh-lip1"},
  {id:16,name:"Assam CTC tea, 1kg family pack",cat:"Grocery",price:399,mrp:599,rating:4.6,seed:"vh-tea1"},
  {id:17,name:"Cold-pressed groundnut oil, 1L",cat:"Grocery",price:279,mrp:399,rating:4.5,seed:"vh-groundnut1"},
  {id:18,name:"Mixed dry fruits gift box",cat:"Grocery",price:799,mrp:1299,rating:4.3,seed:"vh-dry1"},
  {id:19,name:"Wooden building blocks, 60 pieces",cat:"Toys",price:699,mrp:1399,rating:4.5,seed:"vh-blocks1"},
  {id:20,name:"Remote control stunt car",cat:"Toys",price:899,mrp:1799,rating:4.1,seed:"vh-rc1"},
  {id:21,name:"Badminton racket pair with shuttles",cat:"Sports",price:649,mrp:1199,rating:4.3,seed:"vh-badminton1"},
  {id:22,name:"Yoga mat, extra thick 8mm",cat:"Sports",price:549,mrp:999,rating:4.4,seed:"vh-yoga1"},
  {id:23,name:"Hardbound daily planner 2026",cat:"Books",price:349,mrp:599,rating:4.2,seed:"vh-planner1"},
  {id:24,name:"Illustrated Indian folktales collection",cat:"Books",price:449,mrp:799,rating:4.6,seed:"vh-folk1"},
];

function pct(price, mrp) {
  return Math.round((1 - price / mrp) * 100);
}

export default function BuyerDashboard() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [cart, setCart] = useState(0);
  const [wish, setWish] = useState(new Set());
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [addedItems, setAddedItems] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(5 * 3600 + 42 * 60 + 18);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hh = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  const filteredItems = useMemo(() => {
    let items = PRODUCTS.filter((p) => {
      const matchCat = cat === "all" || p.cat === cat;
      const matchQ = p.name.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });

    if (sort === "priceLow") items.sort((a, b) => a.price - b.price);
    else if (sort === "priceHigh") items.sort((a, b) => b.price - a.price);
    else if (sort === "rating") items.sort((a, b) => b.rating - a.rating);
    else items.sort((a, b) => pct(b.price, b.mrp) - pct(a.price, a.mrp));

    return items;
  }, [cat, q, sort]);

  const toggleWish = (id) => {
    setWish((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addToCart = (id) => {
    setCart((c) => c + 1);
    setAddedItems((prev) => new Set(prev).add(id));
    showToast("Added to cart");
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1400);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 1600);
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      
      {/* Utility Bar */}
      <div className="bg-ink text-[#D9DCEC] text-[12.5px]">
        <div className="max-w-[1200px] mx-auto px-5 flex justify-between items-center h-8">
          <span>Ships across India · Bazaar days every Friday</span>
          <nav className="flex gap-4.5">
            <a href="#" className="hover:text-white transition-colors">Sell on VendorHub</a>
            <a href="#" className="hover:text-white transition-colors">Track your order</a>
            <a href="#" className="hover:text-white transition-colors">Help centre</a>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="bg-ink pt-4">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center gap-7 flex-wrap">
          <div className="font-display font-semibold text-[26px] text-white flex items-baseline gap-0.5 tracking-tight">
            Vendor<span className="text-primary">Hub</span>
          </div>
          <form className="flex-1 flex max-w-[640px] min-w-[280px]" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="text" 
              placeholder="Search for kurtas, mixers, phones, notebooks…"
              className="flex-1 border-none rounded-l-md px-4 h-[42px] text-sm bg-white outline-none text-ink"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" aria-label="Search" className="border-none bg-primary text-primary-content w-12 rounded-r-md flex items-center justify-center hover:bg-primary-hover transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>
          <div className="flex items-center gap-5 text-[#EAECF7] text-[13.5px] whitespace-nowrap ml-auto">
            <div className="relative flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <b className="text-[13.5px] font-semibold text-white">Cart</b>
              <span className="absolute -top-2.5 -right-3.5 bg-danger text-white text-[10.5px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">{cart}</span>
            </div>
          </div>
        </div>

        {/* Cat Nav */}
        <div className="border-t border-white/10 mt-4">
          <div className="max-w-[1200px] mx-auto px-5 flex gap-6.5 overflow-x-auto no-scrollbar py-2.5">
            {[
              { id: 'all', label: 'All stalls' },
              { id: 'Electronics', label: 'Electronics' },
              { id: 'Fashion', label: 'Fashion' },
              { id: 'Home', label: 'Home & kitchen' },
              { id: 'Beauty', label: 'Beauty' },
              { id: 'Grocery', label: 'Grocery' },
              { id: 'Toys', label: 'Toys' },
              { id: 'Sports', label: 'Sports' },
              { id: 'Books', label: 'Books' }
            ].map(c => (
              <button 
                key={c.id}
                className={`bg-transparent border-none text-[13.5px] font-medium px-0.5 py-1 border-b-2 whitespace-nowrap hover:text-white transition-colors ${cat === c.id ? 'text-white border-primary' : 'text-[#C6CAE0] border-transparent'}`}
                onClick={() => setCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5">
        
        {/* Hero */}
        <section className="py-6.5 pb-2">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-4">
            <div className="bg-gradient-to-br from-[#1B2340] to-[#2B3766] rounded-2xl p-10 md:p-11 text-white relative overflow-hidden min-h-[230px] flex flex-col justify-center">
              <div className="absolute -right-7 -top-7 w-[220px] h-[220px] rounded-full bg-primary/15"></div>
              <p className="text-[11px] tracking-[0.14em] uppercase font-semibold text-[#B9C0E6] z-10">Bazaar days · Aug 13–16</p>
              <h1 className="font-display font-semibold text-4xl leading-[1.15] mt-2.5 mb-3.5 max-w-[420px] z-10">One marketplace, a thousand small shops.</h1>
              <p className="text-[#C6CAE0] text-[14.5px] max-w-[380px] m-0 mb-5 z-10">Every seller on VendorHub runs their own stall. Buy direct, track deliveries by shop, and split one cart across dozens of vendors.</p>
              <button className="self-start bg-primary text-primary-content border-none font-bold text-sm px-5.5 py-3 rounded-lg hover:bg-primary-hover transition-colors z-10 shadow-soft hover-lift">Browse today's stalls</button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="bg-surface border border-border rounded-xl p-5 flex-1 flex flex-col justify-center">
                <p className="text-[11px] tracking-[0.14em] uppercase font-semibold text-accent">New this week</p>
                <h3 className="font-display text-[19px] font-semibold mt-1.5 mb-1 text-text">Vendor spotlight: Hill Loom Textiles</h3>
                <p className="text-text-muted text-[13px] m-0 mb-2.5">Handwoven cottons direct from Coimbatore, 40% off launch stock.</p>
                <a className="text-[13px] font-bold text-accent hover:underline" href="#">Visit their stall →</a>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 flex-1 flex flex-col justify-center">
                <p className="text-[11px] tracking-[0.14em] uppercase font-semibold text-accent">For sellers</p>
                <h3 className="font-display text-[19px] font-semibold mt-1.5 mb-1 text-text">Open your own stall</h3>
                <p className="text-text-muted text-[13px] m-0 mb-2.5">Zero listing fees for your first 90 days on VendorHub.</p>
                <a className="text-[13px] font-bold text-accent hover:underline" href="#">Start selling →</a>
              </div>
            </div>
          </div>
        </section>

        {/* Category Rail */}
        <section className="py-9 pb-2">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-[22px] font-semibold m-0 text-text">Shop by category</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3.5">
            {[
              { id: 'Electronics', icon: '📱', label: 'Electronics' },
              { id: 'Fashion', icon: '👗', label: 'Fashion' },
              { id: 'Home', icon: '🏺', label: 'Home' },
              { id: 'Beauty', icon: '💄', label: 'Beauty' },
              { id: 'Grocery', icon: '🥭', label: 'Grocery' },
              { id: 'Toys', icon: '🧸', label: 'Toys' },
              { id: 'Sports', icon: '🏸', label: 'Sports' },
              { id: 'Books', icon: '📚', label: 'Books' }
            ].map(c => (
              <div key={c.id} className="bg-surface border border-border rounded-xl p-4 text-center flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors" onClick={() => setCat(c.id)}>
                <div className="w-9.5 h-9.5 rounded-full bg-[#FBEFDA] flex items-center justify-center text-xl">{c.icon}</div>
                <span className="text-xs font-semibold text-text">{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Deals */}
        <section className="py-9 pb-2">
          <div className="bg-danger rounded-t-xl px-5.5 py-3.5 flex items-center justify-between text-white">
            <h2 className="font-display font-semibold text-xl m-0">Today's bazaar deals</h2>
            <div className="flex gap-1.5 text-[12.5px] font-bold items-center">
              <span>ends in</span>
              <span className="bg-white/20 px-2 py-1 rounded-[5px] min-w-[28px] text-center">{hh}</span>:
              <span className="bg-white/20 px-2 py-1 rounded-[5px] min-w-[28px] text-center">{mm}</span>:
              <span className="bg-white/20 px-2 py-1 rounded-[5px] min-w-[28px] text-center">{ss}</span>
            </div>
          </div>
          <div className="bg-surface border border-border border-t-0 rounded-b-xl p-5">
            
            <div className="flex items-center justify-between my-2 mb-4 flex-wrap gap-2.5">
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'popular', label: 'Most popular' },
                  { id: 'priceLow', label: 'Price: low to high' },
                  { id: 'priceHigh', label: 'Price: high to low' },
                  { id: 'rating', label: 'Top rated' }
                ].map(s => (
                  <button 
                    key={s.id}
                    className={`bg-background border rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${sort === s.id ? 'bg-ink text-white border-ink' : 'border-border text-text-soft hover:bg-surface-sunken'}`}
                    onClick={() => setSort(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <select 
                className="border border-border rounded-lg px-2.5 py-2 text-[12.5px] bg-white text-text-soft outline-none focus:border-primary"
                value={cat} 
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="all">All categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home">Home &amp; kitchen</option>
                <option value="Beauty">Beauty</option>
                <option value="Grocery">Grocery</option>
                <option value="Toys">Toys</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredItems.map(p => {
                const off = pct(p.price, p.mrp);
                const wished = wish.has(p.id);
                const isAdded = addedItems.has(p.id);

                return (
                  <div className="bg-surface border border-border rounded-xl p-3.5 relative flex flex-col transition-all hover:shadow-[0_6px_20px_rgba(27,35,64,0.08)] hover:-translate-y-0.5" key={p.id}>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-background mb-2.5">
                      <img src={`https://picsum.photos/seed/${p.seed}/300/300`} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                      <button 
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center cursor-pointer transition-colors ${wished ? 'text-danger' : 'text-text-soft hover:text-danger'}`}
                        onClick={() => toggleWish(p.id)} 
                        aria-label="Save to wishlist"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]"><path d="M12 21s-7.5-4.6-10-9C.6 8.4 2.3 4.5 6 4.5c2 0 3.5 1.1 4 2.4.5-1.3 2-2.4 4-2.4 3.7 0 5.4 3.9 4 7.5-2.5 4.4-10 9-10 9z" className={wished ? 'fill-current' : ''}/></svg>
                      </button>
                      <div className="absolute left-0 bottom-0 bg-primary text-primary-content text-[11px] font-bold px-2 py-1 pr-2 rounded-tr-lg">
                        {off}% off
                      </div>
                    </div>
                    <div className="text-[10.5px] text-text-muted uppercase tracking-[0.06em] font-semibold mb-0.5">{p.cat}</div>
                    <div className="text-[13.5px] font-semibold leading-[1.3] mb-1.5 min-h-[34px] text-text line-clamp-2">{p.name}</div>
                    <div className="inline-flex items-center gap-1 bg-accent text-white text-[11px] font-bold px-1.5 py-0.5 rounded w-fit mb-1.5">
                      ★ {p.rating.toFixed(1)}
                    </div>
                    <div className="flex items-baseline gap-2 mb-2.5">
                      <span className="text-[16px] font-bold text-text">₹{p.price.toLocaleString('en-IN')}</span>
                      <span className="text-[12px] text-text-muted line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                      <span className="text-[12px] text-accent font-bold">{off}% off</span>
                    </div>
                    <button 
                      className={`mt-auto border border-ink font-bold text-[12.5px] py-2 rounded-lg transition-colors ${isAdded ? 'bg-accent border-accent text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'}`}
                      onClick={() => addToCart(p.id)}
                    >
                      {isAdded ? "Added ✓" : "Add to cart"}
                    </button>
                  </div>
                );
              })}
            </div>
            {filteredItems.length === 0 && (
              <div className="py-10 text-center text-text-muted text-sm">No stalls have that yet — try another search.</div>
            )}
          </div>
        </section>

        {/* Trust Strip */}
        <section className="py-11">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚚', title: 'Free delivery over ₹499', desc: 'On orders from any single stall.' },
              { icon: '↩️', title: '7-day easy returns', desc: 'No questions, per-vendor pickup.' },
              { icon: '🔒', title: 'Secure checkout', desc: 'Payments held until delivery confirms.' },
              { icon: '💬', title: '24×7 support', desc: 'Chat with us or the stall owner directly.' }
            ].map((t, i) => (
              <div key={i} className="flex gap-3 items-start bg-surface border border-border rounded-xl p-4">
                <div className="w-9 h-9 rounded-full bg-[#E6F2F1] flex items-center justify-center shrink-0 text-[18px]">{t.icon}</div>
                <div>
                  <h4 className="m-0 mb-1 text-[13.5px] font-bold text-text">{t.title}</h4>
                  <p className="m-0 text-xs text-text-muted">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-ink text-[#B9C0E6] pt-10 pb-5 mt-5">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pb-7 border-b border-white/10">
            <div>
              <h5 className="text-white text-xs tracking-[0.08em] uppercase m-0 mb-3 font-semibold">VendorHub</h5>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">About us</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Careers</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Press</a>
            </div>
            <div>
              <h5 className="text-white text-xs tracking-[0.08em] uppercase m-0 mb-3 font-semibold">Help</h5>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Payments</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Shipping</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Cancellation &amp; returns</a>
            </div>
            <div>
              <h5 className="text-white text-xs tracking-[0.08em] uppercase m-0 mb-3 font-semibold">Policy</h5>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Return policy</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Terms of use</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Privacy</a>
            </div>
            <div>
              <h5 className="text-white text-xs tracking-[0.08em] uppercase m-0 mb-3 font-semibold">Sell with us</h5>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Open a stall</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Seller help</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Advertise</a>
            </div>
            <div>
              <h5 className="text-white text-xs tracking-[0.08em] uppercase m-0 mb-3 font-semibold">Follow</h5>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Instagram</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">X</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">YouTube</a>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4.5 text-[12.5px] text-[#8A90B6] flex-wrap gap-2.5">
            <span>© 2026 VendorHub Marketplace. Demo storefront for illustration only.</span>
            <span>Made for VendorHub sellers &amp; shoppers</span>
          </div>
        </div>
      </footer>

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-3 rounded-lg text-[13.5px] font-semibold transition-all duration-200 pointer-events-none z-50 ${toastShow ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
        {toastMsg}
      </div>
    </div>
  );
}
