import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TargetCursor from '../components/TargetCursor';
import './LandingPage.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInputRef.current?.value) {
      // In a real app, this would route to a search page
      console.log('Search for:', searchInputRef.current.value);
    }
  };

  const categories = [
    { name: 'Electronics', count: '1,240 products', icon: <><path d="M8 4H16C16.55 4 17 4.45 17 5V19C17 19.55 16.55 20 16 20H8C7.45 20 7 19.55 7 19V5C7 4.45 7.45 4 8 4Z" stroke="#E8891E" strokeWidth="1.6"/><line x1="7" y1="17" x2="17" y2="17" stroke="#E8891E" strokeWidth="1.6"/></> },
    { name: 'Fashion', count: '2,180 products', icon: <path d="M9 4L12 6L15 4L19 7L16.5 10L15 9V20H9V9L7.5 10L5 7L9 4Z" stroke="#E8891E" strokeWidth="1.6" strokeLinejoin="round"/> },
    { name: 'Grocery', count: '3,050 products', icon: <><path d="M12 3C12 3 8 7 8 11C8 13.2 9.8 15 12 15C14.2 15 16 13.2 16 11C16 7 12 3 12 3Z" stroke="#E8891E" strokeWidth="1.6"/><line x1="12" y1="15" x2="12" y2="21" stroke="#E8891E" strokeWidth="1.6"/></> },
    { name: 'Home & Living', count: '980 products', icon: <><path d="M4 12H20V17C20 17.55 19.55 18 19 18H5C4.45 18 4 17.55 4 17V12Z" stroke="#E8891E" strokeWidth="1.6"/><path d="M5 12V9C5 8.45 5.45 8 6 8H18C18.55 8 19 8.45 19 9V12" stroke="#E8891E" strokeWidth="1.6"/><line x1="5" y1="18" x2="5" y2="20" stroke="#E8891E" strokeWidth="1.6"/><line x1="19" y1="18" x2="19" y2="20" stroke="#E8891E" strokeWidth="1.6"/></> },
    { name: 'Beauty', count: '760 products', icon: <path d="M12 3L14 9L20 10L15.5 14L17 20L12 17L7 20L8.5 14L4 10L10 9L12 3Z" stroke="#E8891E" strokeWidth="1.5" strokeLinejoin="round"/> },
    { name: 'Sports', count: '540 products', icon: <><circle cx="12" cy="12" r="8" stroke="#E8891E" strokeWidth="1.6"/><path d="M12 4V20M4 12H20" stroke="#E8891E" strokeWidth="1.2"/></> },
    { name: 'Books', count: '410 products', icon: <><path d="M4 5C4 4.45 4.45 4 5 4H11V20H5C4.45 20 4 19.55 4 19V5Z" stroke="#E8891E" strokeWidth="1.6"/><path d="M20 5C20 4.45 19.55 4 19 4H13V20H19C19.55 20 20 19.55 20 19V5Z" stroke="#E8891E" strokeWidth="1.6"/></> },
    { name: 'Accessories', count: '890 products', icon: <><circle cx="12" cy="12" r="7" stroke="#E8891E" strokeWidth="1.6"/><path d="M12 9V12L14 14" stroke="#E8891E" strokeWidth="1.6" strokeLinecap="round"/></> }
  ];

  const activity = [
    <React.Fragment key="1">Ananya in Bengaluru just ordered from <b>Homeware Co.</b></React.Fragment>,
    <React.Fragment key="2"><b>TechZone</b> confirmed a same-day delivery in Indiranagar</React.Fragment>,
    <React.Fragment key="3">Marcus in Austin discovered a new seller: <b>Cedar & Co.</b></React.Fragment>,
    <React.Fragment key="4">Priya just opened a storefront: <b>Nair Ceramics</b></React.Fragment>,
    <React.Fragment key="5">A ceramic planter sold 2.4 km from you</React.Fragment>,
    <React.Fragment key="6"><b>Kochi Coffee Roasters</b> added 12 new products</React.Fragment>,
    <React.Fragment key="7">Order #4821 delivered in 38 minutes</React.Fragment>
  ];

  return (
    <div className="vendorhub-landing">
      <TargetCursor
        targetSelector=".cursor-target"
        cursorColor="#E8891E"
        cursorColorOnTarget="#1C2140"
        spinDuration={3}
        hoverDuration={0.18}
        parallaxOn={true}
        hideDefaultCursor={true}
      />
      {/* ---------- nav ---------- */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`} id="nav">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 8L12 3L20 8V19C20 19.55 19.55 20 19 20H5C4.45 20 4 19.55 4 19V8Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M9 20V13H15V20" stroke="#fff" strokeWidth="1.8"/>
            </svg>
          </span>
          Vendor<span>Hub</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="#categories">Explore</a>
          <a href="#categories">Categories</a>
          <a href="#how">How It Works</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-ghost cursor-target">Log In</Link>
          <Link to="/signup" className="btn-amber cursor-target">Sign Up</Link>
          <div className="cart-dot" title="Cart (example)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 3H5L7.4 14.5C7.5 15.3 8.2 15.9 9 15.9H18C18.8 15.9 19.5 15.3 19.6 14.5L21 6H6" stroke="#1C2140" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9.5" cy="20" r="1.4" fill="#1C2140"/>
              <circle cx="17.5" cy="20" r="1.4" fill="#1C2140"/>
            </svg>
            <span className="badge">3</span>
          </div>
        </div>
      </nav>

      {/* ---------- hero ---------- */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow reveal"><span className="dot"></span>Hyperlocal marketplace, reimagined</span>
            <h1 className="reveal" style={{ transitionDelay: '.08s' }}>Shop local.<span className="accent">Discover more.</span></h1>
            <p className="lead reveal" style={{ transitionDelay: '.16s' }}>Find trusted sellers a few streets away, browse recommendations tuned to what you love, and get it delivered before you'd finish scrolling a big-box app.</p>

            <form className="search-bar reveal cursor-target" style={{ transitionDelay: '.24s' }} onSubmit={handleSearch}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#9A9CB0" strokeWidth="2"/>
                <path d="M21 21L16.5 16.5" stroke="#9A9CB0" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Search for products, brands or categories…" ref={searchInputRef} />
              <button type="submit">Search</button>
            </form>

            <div className="hero-cta-row reveal" style={{ transitionDelay: '.32s' }}>
              <a href="#categories" className="btn-amber cursor-target" style={{ padding: '14px 28px' }}>Start Shopping →</a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatars">
                  <span style={{ background: '#E8891E' }}></span>
                  <span style={{ background: '#12645C' }}></span>
                  <span style={{ background: '#F6B44A' }}></span>
                  <span style={{ background: '#565C7C' }}></span>
                </div>
                <span className="trust-text"><b>12,000+</b> trusted by local shoppers</span>
              </div>
            </div>
          </div>

          <div className="hero-visual reveal" style={{ transitionDelay: '.2s' }}>
            <div className="float-card card-a cursor-target">
              <div className="thumb">
                <img src="https://images.unsplash.com/photo-1572569979132-b4f10c9ec185?fm=jpg&q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0" alt="White wireless earbuds" loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <div className="name">Wireless Earbuds</div>
              <div className="meta"><span className="price">₹2,399</span><span className="shop">TechZone</span></div>
            </div>
            <div className="float-card card-b cursor-target">
              <div className="thumb">
                <img src="https://images.unsplash.com/photo-1611651625032-153048f0da00?fm=jpg&q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0" alt="Ceramic planter with plant" loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <div className="name">Ceramic Planter</div>
              <div className="meta"><span className="price">₹1,299</span><span className="shop">Homeware Co.</span></div>
            </div>
            <div className="pin-ring"></div>
            <div className="pin-ring d2"></div>
            <div className="pin">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 21C12 21 19 15 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 15 12 21 12 21Z" stroke="#fff" strokeWidth="1.8"/>
                <circle cx="12" cy="9.5" r="2.4" fill="#fff"/>
              </svg>
            </div>
            <div className="pin-label">You are here</div>
            <div className="chip chip-a">
              <span className="ico">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="#12645C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>Local seller · 2.4 km
            </div>
            <div className="chip chip-b">
              <span className="ico">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.2 8.6L21 9.3L15.8 13.6L17.5 20.3L12 16.6L6.5 20.3L8.2 13.6L3 9.3L9.8 8.6L12 2Z" stroke="#E8891E" strokeWidth="1.6" strokeLinejoin="round"/>
                </svg>
              </span>AI recommended
            </div>
          </div>
        </div>
      </section>

      {/* ---------- marquee ---------- */}
      <div className="ticker-wrap">
        <div className="fade-l"></div><div className="fade-r"></div>
        <div className="ticker-track">
          {[...activity, ...activity].map((t, idx) => (
            <div key={idx} className="ticker-item">
              <span className="dot-live"></span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- categories ---------- */}
      <section className="section" id="categories">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow-txt">Shop by category</span>
            <h2>Find everything you need, from sellers around you</h2>
            <p>Eight categories, thousands of local shops — curated by what's actually available near your pin, not a warehouse three states over.</p>
          </div>
          <div className="cat-grid reveal-stagger">
            {categories.map((c, i) => (
              <div key={i} className="cat-card cursor-target">
                <div className="cat-ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">{c.icon}</svg>
                </div>
                <h3>{c.name}</h3>
                <div className="count">{c.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="section" id="how" style={{ background: 'var(--cream-deep)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow-txt">How it works</span>
            <h2>From "I need this" to your doorstep, in three steps</h2>
          </div>
          <div className="steps reveal-stagger">
            <div className="step">
              <span className="num">01 · Discover</span>
              <h3>Find what's nearby</h3>
              <p>Search once and see the sellers already stocking it within your neighborhood — ranked by distance and rating.</p>
            </div>
            <div className="step">
              <span className="num">02 · Order</span>
              <h3>Checkout in a tap</h3>
              <p>Clear pricing, real seller reviews, and one cart even when you're buying from three different local shops.</p>
            </div>
            <div className="step">
              <span className="num">03 · Receive</span>
              <h3>Get it same-day</h3>
              <p>Because your seller is minutes away, not a warehouse away, delivery windows shrink from days to hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- testimonials ---------- */}
      <section className="section">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow-txt">Testimonials</span>
            <h2>Loved by local shoppers</h2>
          </div>
          <div className="test-grid reveal-stagger">
            <div className="test-card cursor-target">
              <div className="stars">★★★★★</div>
              <p className="quote">"I found a home decor seller two streets away I never knew existed. Delivery took under an hour and the packaging felt genuinely local."</p>
              <div className="test-person">
                <span className="av" style={{ background: '#E8891E' }}>AR</span>
                <span className="who"><b>Ananya Rao</b><span>Bengaluru, IN</span></span>
              </div>
            </div>
            <div className="test-card cursor-target">
              <div className="stars">★★★★★</div>
              <p className="quote">"The AI search actually understands what I mean. I typed 'laptop bag' and it surfaced options I'd never have found searching manually."</p>
              <div className="test-person">
                <span className="av" style={{ background: '#12645C' }}>MW</span>
                <span className="who"><b>Marcus Webb</b><span>Austin, TX</span></span>
              </div>
            </div>
            <div className="test-card cursor-target">
              <div className="stars">★★★★☆</div>
              <p className="quote">"As a small seller, VendorHub gave me an online storefront in a weekend. Order and inventory management is genuinely easy to use."</p>
              <div className="test-person">
                <span className="av" style={{ background: '#565C7C' }}>PN</span>
                <span className="who"><b>Priya Nair</b><span>Kochi, IN</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA banner ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta-banner reveal">
            <h2>Ready to shop local?</h2>
            <p>Join thousands of buyers and sellers building a marketplace that actually knows its neighborhood.</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn-amber cursor-target" style={{ padding: '14px 30px' }}>Create free account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div style={{ maxWidth: '280px' }}>
              <Link to="/" className="brand" style={{ marginBottom: '14px', display: 'inline-flex' }}>
                <span className="brand-mark" style={{ width: '30px', height: '30px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 8L12 3L20 8V19C20 19.55 19.55 20 19 20H5C4.45 20 4 19.55 4 19V8Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M9 20V13H15V20" stroke="#fff" strokeWidth="1.8"/>
                  </svg>
                </span>
                Vendor<span>Hub</span>
              </Link>
              <p style={{ fontSize: '14px', color: 'var(--navy-soft)', lineHeight: 1.6, marginTop: '10px' }}>The marketplace for the shops already in your neighborhood.</p>
            </div>
            <div className="foot-cols">
              <div className="foot-col">
                <h4>Shop</h4>
                <a href="#categories">Explore</a>
                <a href="#categories">Categories</a>
              </div>
              <div className="foot-col">
                <h4>Company</h4>
                <Link to="/">About</Link>
                <Link to="/">Careers</Link>
                <Link to="/">Contact</Link>
              </div>
              <div className="foot-col">
                <h4>Support</h4>
                <Link to="/">Help center</Link>
                <Link to="/">Order tracking</Link>
                <Link to="/">Returns</Link>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 VendorHub. All rights reserved.</span>
            <span>Made for shoppers who like their sellers within walking distance.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
