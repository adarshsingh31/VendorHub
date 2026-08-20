import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import { Search, ShoppingCart } from 'lucide-react';

export default function HomeHeader() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { cartCount } = useShop();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buyer/products?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(`/buyer/products`);
    }
  };

  return (
    <header className="bg-ink pt-4 pb-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-5 flex flex-wrap items-center gap-4 md:gap-7">
        
        {/* Logo */}
        <div 
          onClick={() => navigate('/buyer/dashboard')}
          className="font-display font-semibold text-[26px] text-white flex items-baseline gap-0.5 tracking-tight cursor-pointer"
        >
          Vendor<span className="text-primary">Hub</span>
        </div>
        
        {/* Search Bar */}
        <form 
          className="flex-1 flex min-w-[240px] md:max-w-[640px] order-last md:order-none" 
          onSubmit={handleSearch}
        >
          <input 
            type="text" 
            placeholder="Search for products, brands and more..."
            className="flex-1 border-none rounded-l-md px-4 h-[42px] text-sm bg-white outline-none text-ink placeholder:text-text-soft"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit" 
            aria-label="Search" 
            className="border-none bg-primary text-primary-content w-12 rounded-r-md flex items-center justify-center hover:bg-primary-hover transition-colors"
          >
            <Search size={18} />
          </button>
        </form>
        
        {/* Actions */}
        <div className="flex items-center gap-5 ml-auto text-white">
          <div 
            onClick={() => navigate('/buyer/cart')}
            className="relative flex items-center gap-1.5 cursor-pointer group"
          >
            <ShoppingCart size={22} className="group-hover:text-primary transition-colors" />
            <b className="hidden md:inline text-[13.5px] font-semibold group-hover:text-primary transition-colors">Cart</b>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-danger text-white text-[10.5px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
