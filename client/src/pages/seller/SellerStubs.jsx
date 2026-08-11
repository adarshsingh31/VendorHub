import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

const stubPages = {
  SellerProducts:  { title: 'My Products', icon: 'inventory_2', desc: 'Manage your product listings.' },
  AddProduct:      { title: 'Add Product', icon: 'add_box', desc: 'List a new product for sale.' },
  SellerInventory: { title: 'Inventory', icon: 'shelves', desc: 'Track your stock levels.' },
  SellerOrders:    { title: 'Orders', icon: 'shopping_cart', desc: 'View and manage customer orders.' },
  SellerEarnings:  { title: 'Earnings', icon: 'payments', desc: 'Track your revenue and withdrawals.' },
  SellerReviews:   { title: 'Reviews', icon: 'star', desc: 'See what customers are saying.' },
  SellerAnalytics: { title: 'Analytics', icon: 'monitoring', desc: 'Understand your store performance.' },
  SellerSettings:  { title: 'Store Settings', icon: 'settings', desc: 'Update your store profile and preferences.' },
};

function SellerStubPage({ pageKey }) {
  const { user } = useAuth();
  const userName = user?.name || 'Seller';
  const userInitial = userName.charAt(0).toUpperCase();
  const page = stubPages[pageKey];

  return (
    <div className="min-h-screen bg-[#F4F1EA] font-[Manrope,sans-serif] text-on-surface flex">
      <Sidebar role="seller" userName={userName} userInitial={userInitial} />
      <main className="flex-1 md:ml-64 p-6 pb-20 md:pb-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-primary text-4xl">{page.icon}</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">{page.title}</h1>
        <p className="text-on-surface-variant max-w-md">{page.desc}</p>
        <p className="text-sm text-on-surface-variant/60 mt-4">This page is under construction. Backend integration coming soon.</p>
      </main>
    </div>
  );
}

export const SellerProductsPage  = () => <SellerStubPage pageKey="SellerProducts" />;
export const AddProductPage      = () => <SellerStubPage pageKey="AddProduct" />;
export const SellerInventoryPage = () => <SellerStubPage pageKey="SellerInventory" />;
export const SellerOrdersPage    = () => <SellerStubPage pageKey="SellerOrders" />;
export const SellerEarningsPage  = () => <SellerStubPage pageKey="SellerEarnings" />;
export const SellerReviewsPage   = () => <SellerStubPage pageKey="SellerReviews" />;
export const SellerAnalyticsPage = () => <SellerStubPage pageKey="SellerAnalytics" />;
export const SellerSettingsPage  = () => <SellerStubPage pageKey="SellerSettings" />;
