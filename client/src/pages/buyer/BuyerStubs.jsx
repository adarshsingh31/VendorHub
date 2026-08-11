import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

const stubPages = {
  BuyerProducts:  { title: 'Browse Products', icon: 'search', desc: 'Discover thousands of local products.' },
  ProductDetails: { title: 'Product Details', icon: 'inventory_2', desc: 'View detailed product information.' },
  Cart:           { title: 'My Cart', icon: 'shopping_cart', desc: 'Review items before checkout.' },
  Checkout:       { title: 'Checkout', icon: 'payment', desc: 'Complete your purchase securely.' },
  BuyerOrders:    { title: 'My Orders', icon: 'receipt_long', desc: 'Track all your past and current orders.' },
  Wishlist:       { title: 'My Wishlist', icon: 'favorite', desc: 'Products you have saved for later.' },
  Addresses:      { title: 'Saved Addresses', icon: 'location_on', desc: 'Manage your delivery addresses.' },
};

function BuyerStubPage({ pageKey }) {
  const { user } = useAuth();
  const userName = user?.name || 'Buyer';
  const userInitial = userName.charAt(0).toUpperCase();
  const page = stubPages[pageKey];

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex">
      <Sidebar role="buyer" userName={userName} userInitial={userInitial} />
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

export const BuyerProductsPage  = () => <BuyerStubPage pageKey="BuyerProducts" />;
export const ProductDetailsPage = () => <BuyerStubPage pageKey="ProductDetails" />;
export const CartPage           = () => <BuyerStubPage pageKey="Cart" />;
export const CheckoutPage       = () => <BuyerStubPage pageKey="Checkout" />;
export const BuyerOrdersPage    = () => <BuyerStubPage pageKey="BuyerOrders" />;
export const WishlistPage       = () => <BuyerStubPage pageKey="Wishlist" />;
export const AddressesPage      = () => <BuyerStubPage pageKey="Addresses" />;
