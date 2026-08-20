import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function ProductSection({ title, subtitle, products, loading, emptyMessage, theme = "default" }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="py-8 border-t border-border/50">
        <h2 className="font-display text-[22px] font-semibold mb-4 text-text">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-3.5 h-[320px] flex flex-col gap-3 animate-pulse">
              <div className="w-full aspect-square bg-border rounded-lg"></div>
              <div className="h-3 w-1/3 bg-border rounded mt-1"></div>
              <div className="h-4 w-full bg-border rounded"></div>
              <div className="h-4 w-1/2 bg-border rounded"></div>
              <div className="mt-auto h-9 w-full bg-border rounded-lg"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-8 border-t border-border/50">
        <h2 className="font-display text-[22px] font-semibold mb-2 text-text">{title}</h2>
        <div className="bg-surface rounded-xl border border-border p-8 text-center text-text-muted text-sm shadow-soft">
          {emptyMessage || "Nothing to show right now."}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 border-t border-border/50">
      <div className="flex items-end justify-between mb-5">
        <div>
          {subtitle && (
            <p className="text-[11px] tracking-[0.14em] uppercase font-semibold text-accent mb-1">
              {subtitle}
            </p>
          )}
          <h2 className="font-display text-[22px] font-semibold m-0 text-text">{title}</h2>
        </div>
        <button 
          onClick={() => navigate('/buyer/products')}
          className="text-sm font-bold text-accent hover:underline mb-0.5"
        >
          Explore more →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
