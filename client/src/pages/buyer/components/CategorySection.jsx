import React, { useState, useEffect } from 'react';
import { homeService } from '../../../services/homeService';
import { useNavigate } from 'react-router-dom';

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await homeService.getCategories();
        if (data.categories) {
          setCategories(data.categories.slice(0, 8)); // Show max 8
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="font-display text-[22px] font-semibold mb-4 text-text">Shop by category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3.5">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-surface rounded-xl p-4 flex flex-col items-center gap-2 animate-pulse h-[104px]">
              <div className="w-10 h-10 rounded-full bg-border"></div>
              <div className="h-3 w-16 bg-border rounded mt-1"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-[22px] font-semibold m-0 text-text">Shop by category</h2>
        <button 
          onClick={() => navigate('/buyer/products')}
          className="text-sm font-bold text-accent hover:underline"
        >
          View all →
        </button>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3.5">
        {categories.map(c => (
          <div 
            key={c.id} 
            onClick={() => navigate(`/buyer/products?category=${encodeURIComponent(c.id)}`)}
            className="bg-surface border border-border rounded-xl p-4 text-center flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:-translate-y-0.5 hover:shadow-soft transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#FBEFDA] flex items-center justify-center text-[22px]">
              {c.icon}
            </div>
            <span className="text-[12.5px] font-semibold text-text truncate w-full">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
