import React from 'react';
import { Package } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { isInCart, addToCart, toggleWishlist, isInWishlist } = useShop();
  const navigate = useNavigate();

  const off = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
    
  const wished = isInWishlist(product._id);
  const inCart = isInCart(product._id);

  const handleCardClick = () => {
    navigate(`/buyer/products/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!inCart) {
      addToCart(product._id);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-surface border border-border rounded-xl p-3.5 relative flex flex-col transition-all hover:shadow-[0_6px_20px_rgba(27,35,64,0.08)] hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="relative rounded-lg overflow-hidden aspect-square bg-background mb-2.5 flex items-center justify-center">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <Package className="text-border" size={32} />
        )}
        <button 
          className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center cursor-pointer transition-colors ${wished ? 'text-danger' : 'text-text-soft hover:text-danger'}`}
          onClick={handleWishlist} 
          aria-label="Save to wishlist"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]">
            <path d="M12 21s-7.5-4.6-10-9C.6 8.4 2.3 4.5 6 4.5c2 0 3.5 1.1 4 2.4.5-1.3 2-2.4 4-2.4 3.7 0 5.4 3.9 4 7.5-2.5 4.4-10 9-10 9z" className={wished ? 'fill-current' : ''}/>
          </svg>
        </button>
        {off > 0 && (
          <div className="absolute left-0 bottom-0 bg-primary text-primary-content text-[11px] font-bold px-2 py-1 pr-2 rounded-tr-lg shadow-sm">
            {off}% off
          </div>
        )}
      </div>
      
      <div className="text-[10.5px] text-text-muted uppercase tracking-[0.06em] font-semibold mb-0.5 truncate">
        {product.category || 'General'}
      </div>
      
      <div className="text-[13.5px] font-semibold leading-[1.3] mb-1.5 min-h-[34px] text-text line-clamp-2">
        {product.name}
      </div>
      
      <div className="inline-flex items-center gap-1 bg-accent text-white text-[11px] font-bold px-1.5 py-0.5 rounded w-fit mb-1.5">
        ★ {(product.rating || 4.5).toFixed(1)}
      </div>
      
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="text-[16px] font-bold text-text">₹{product.price?.toLocaleString('en-IN')}</span>
        {off > 0 && (
          <span className="text-[12px] text-text-muted line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
        )}
      </div>
      
      <button 
        className={`mt-auto border font-bold text-[12.5px] py-2 rounded-lg transition-colors ${inCart ? 'bg-accent border-accent text-white' : 'border-ink bg-white text-ink hover:bg-ink hover:text-white'}`}
        onClick={handleAddToCart}
        disabled={inCart}
      >
        {inCart ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
