import React, { useState, useEffect } from 'react';
import { homeService } from '../../../services/homeService';
import SellerCard from './SellerCard';
import { Store } from 'lucide-react';

export default function PopularSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const data = await homeService.getFeaturedSellers();
        if (data.sellers) setSellers(data.sellers);
      } catch (error) {
        console.error("Failed to fetch featured sellers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  if (loading) {
    return (
      <section className="py-8 border-t border-border/50">
        <h2 className="font-display text-[22px] font-semibold mb-4 text-text">Popular Sellers</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 flex flex-col items-center animate-pulse h-[220px]">
              <div className="w-16 h-16 rounded-full bg-border mb-3"></div>
              <div className="h-4 w-3/4 bg-border rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-border rounded mb-4"></div>
              <div className="mt-auto h-8 w-full bg-border rounded-lg"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (sellers.length === 0) return null;

  return (
    <section className="py-8 border-t border-border/50">
      <div className="flex items-center gap-2 mb-5">
        <Store className="text-accent" size={24} />
        <h2 className="font-display text-[22px] font-semibold m-0 text-text">Popular Sellers</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {sellers.map(seller => (
          <SellerCard key={seller._id} seller={seller} />
        ))}
      </div>
    </section>
  );
}
