import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/axiosInstance';

export default function SellerCTA() {
  const [appStatus, setAppStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/api/seller/application');
        if (data.application) {
          setAppStatus(data.application.status); // pending, approved, rejected
        }
      } catch (error) {
        // silently fail if no application or unauthenticated
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
  }, [isAuthenticated]);

  if (loading) {
    return <div className="w-full h-32 bg-surface rounded-xl animate-pulse mt-8"></div>;
  }

  const renderContent = () => {
    if (appStatus === 'pending') {
      return (
        <>
          <h3 className="font-display text-[22px] font-semibold text-text mb-2">Your application is under review</h3>
          <p className="text-text-muted text-sm max-w-xl mx-auto mb-5">Our admin team is currently reviewing your seller application. We'll notify you as soon as a decision is made.</p>
          <button 
            onClick={() => navigate('/buyer/become-seller')}
            className="bg-background border border-border text-text font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-surface-sunken transition-colors"
          >
            Check Status
          </button>
        </>
      );
    }
    
    if (appStatus === 'approved') {
      return (
        <>
          <h3 className="font-display text-[22px] font-semibold text-text mb-2">You are an approved seller!</h3>
          <p className="text-text-muted text-sm max-w-xl mx-auto mb-5">Start listing your products and grow your business on VendorHub today.</p>
          <button 
            onClick={() => navigate('/seller/dashboard')}
            className="bg-primary text-primary-content font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors"
          >
            Go to Seller Panel
          </button>
        </>
      );
    }

    return (
      <>
        <p className="text-[11px] tracking-[0.14em] uppercase font-semibold text-accent mb-2">For Sellers</p>
        <h3 className="font-display text-[26px] font-semibold text-text mb-2">Start Selling on VendorHub</h3>
        <p className="text-text-muted text-[14.5px] max-w-xl mx-auto mb-6">Join thousands of local vendors and open your own digital stall. Zero listing fees for your first 90 days.</p>
        <button 
          onClick={() => navigate(isAuthenticated ? '/buyer/become-seller' : '/login')}
          className="bg-primary text-primary-content font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-soft"
        >
          Become a Seller
        </button>
      </>
    );
  };

  return (
    <section className="py-12 mt-4">
      <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 text-center shadow-sm">
        {renderContent()}
      </div>
    </section>
  );
}
