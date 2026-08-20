import React, { useState, useEffect } from 'react';
import { homeService } from '../../../services/homeService';
import { useNavigate } from 'react-router-dom';

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await homeService.getBanners();
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        }
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="w-full min-h-[230px] bg-surface rounded-2xl animate-pulse mt-6"></div>
    );
  }

  // Fallback default banner if nothing in DB
  const displayBanners = banners.length > 0 ? banners : [{
    _id: 'default',
    title: 'One marketplace, a thousand small shops.',
    subtitle: 'Every seller on VendorHub runs their own stall. Buy direct, track deliveries by shop, and split one cart across dozens of vendors.',
    ctaText: "Browse today's stalls",
    ctaLink: '/buyer/products'
  }];

  const current = displayBanners[currentIdx];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B2340] to-[#2B3766] mt-6 min-h-[230px] flex items-center shadow-md">
      {/* Background Decorative Circle */}
      <div className="absolute -right-10 -top-10 w-[240px] h-[240px] rounded-full bg-primary/15 hidden md:block"></div>
      
      {current.image && (
        <div className="absolute inset-0 opacity-20">
          <img src={current.image} alt={current.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="relative z-10 p-8 md:p-12 text-white flex flex-col justify-center">
        {current.subtitle && (
          <p className="text-[12px] md:text-sm tracking-[0.08em] font-semibold text-[#B9C0E6] mb-2 uppercase max-w-xl">
            {current.subtitle}
          </p>
        )}
        <h1 className="font-display font-bold text-3xl md:text-4xl leading-[1.2] mb-5 max-w-[500px]">
          {current.title}
        </h1>
        
        {current.ctaText && (
          <button 
            onClick={() => navigate(current.ctaLink || '/buyer/products')}
            className="self-start bg-primary text-primary-content font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors shadow-soft hover:-translate-y-0.5 active:translate-y-0"
          >
            {current.ctaText}
          </button>
        )}
      </div>

      {/* Dots for carousel */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {displayBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIdx ? 'bg-primary w-6' : 'bg-white/40 hover:bg-white/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
