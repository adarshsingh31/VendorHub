import React from 'react';
import { Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SellerCard({ seller }) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col items-center text-center transition-all hover:shadow-[0_6px_20px_rgba(27,35,64,0.08)] hover:-translate-y-0.5">
      <div className="w-16 h-16 rounded-full bg-[#E6F2F1] flex items-center justify-center text-xl overflow-hidden mb-3">
        {seller.avatar ? (
          <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
        ) : (
          <Store className="text-accent" size={28} />
        )}
      </div>
      <h3 className="font-bold text-text mb-1 truncate w-full">{seller.name}</h3>
      <div className="flex items-center gap-1 bg-accent/10 text-accent text-[11px] font-bold px-2 py-0.5 rounded-full mb-3">
        ★ {seller.rating || 4.8}
      </div>
      <p className="text-xs text-text-muted mb-4 line-clamp-2 min-h-[32px]">
        {seller.productCount} {seller.productCount === 1 ? 'product' : 'products'} available in store
      </p>
      <button 
        onClick={() => navigate(`/buyer/products?seller=${seller._id}`)}
        className="mt-auto w-full border border-primary text-primary font-bold text-[12.5px] py-1.5 rounded-lg hover:bg-primary hover:text-primary-content transition-colors"
      >
        Visit Store
      </button>
    </div>
  );
}
