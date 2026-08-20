import React, { useState, useEffect } from 'react';
import { homeService } from '../../services/homeService';
import HomeHeader from './components/HomeHeader';
import HeroBanner from './components/HeroBanner';
import CategorySection from './components/CategorySection';
import ProductSection from './components/ProductSection';
import PopularSellers from './components/PopularSellers';
import SellerCTA from './components/SellerCTA';

export default function BuyerDashboard() {
  const [data, setData] = useState({
    newArrivals: [],
    trending: [],
    deals: [],
    recommended: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [
          newArrivalsRes,
          trendingRes,
          dealsRes,
          recRes,
        ] = await Promise.allSettled([
          homeService.getNewArrivals(),
          homeService.getTrending(),
          homeService.getDeals(),
          homeService.getRecommended(),
        ]);

        setData({
          newArrivals: newArrivalsRes.status === 'fulfilled' ? newArrivalsRes.value.products : [],
          trending: trendingRes.status === 'fulfilled' ? trendingRes.value.products : [],
          deals: dealsRes.status === 'fulfilled' ? dealsRes.value.products : [],
          recommended: recRes.status === 'fulfilled' ? recRes.value.products : [],
        });
      } catch (error) {
        console.error("Failed to fetch homepage data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text font-sans flex flex-col">
      <HomeHeader />
      
      <main className="max-w-[1200px] mx-auto px-5 w-full flex-1">
        <HeroBanner />
        
        <CategorySection />
        
        <ProductSection 
          title="Trending Products"
          subtitle="Top Picks"
          products={data.trending}
          loading={loading}
          emptyMessage="No trending products available right now."
        />

        {(!loading && data.deals?.length > 0) && (
          <ProductSection 
            title="Deals for You"
            subtitle="Limited Time Offers"
            products={data.deals}
            loading={loading}
          />
        )}
        
        <ProductSection 
          title="New Arrivals"
          subtitle="Fresh Stock"
          products={data.newArrivals}
          loading={loading}
          emptyMessage="No new products added recently."
        />
        
        <PopularSellers />
        
        <ProductSection 
          title="Recommended for You"
          subtitle="Based on your activity"
          products={data.recommended}
          loading={loading}
          emptyMessage="Browse some products to get recommendations!"
        />
        
        <SellerCTA />
        
        {/* Trust Strip */}
        <section className="py-11 border-t border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚚', title: 'Free delivery over ₹499', desc: 'On orders from any single stall.' },
              { icon: '↩️', title: '7-day easy returns', desc: 'No questions, per-vendor pickup.' },
              { icon: '🔒', title: 'Secure checkout', desc: 'Payments held until delivery confirms.' },
              { icon: '💬', title: '24×7 support', desc: 'Chat with us or the stall owner directly.' }
            ].map((t, i) => (
              <div key={i} className="flex gap-3 items-start bg-surface border border-border rounded-xl p-4 transition-all hover:shadow-soft">
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

      <footer className="bg-ink text-[#B9C0E6] pt-10 pb-5 mt-auto">
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
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Returns</a>
            </div>
            <div>
              <h5 className="text-white text-xs tracking-[0.08em] uppercase m-0 mb-3 font-semibold">Policy</h5>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Terms of use</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Privacy</a>
            </div>
            <div>
              <h5 className="text-white text-xs tracking-[0.08em] uppercase m-0 mb-3 font-semibold">Sell with us</h5>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Open a stall</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Seller help</a>
            </div>
            <div>
              <h5 className="text-white text-xs tracking-[0.08em] uppercase m-0 mb-3 font-semibold">Follow</h5>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">Instagram</a>
              <a href="#" className="block text-[13px] mb-2 text-[#B9C0E6] hover:text-white transition-colors">X</a>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4.5 text-[12.5px] text-[#8A90B6] flex-wrap gap-2.5">
            <span>© {new Date().getFullYear()} VendorHub Marketplace. Built with modern MERN.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
