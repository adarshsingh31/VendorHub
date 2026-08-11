import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

const stubPages = {
  SellerApplications: { title: 'Seller Applications', icon: 'assignment', desc: 'Review and manage seller onboarding requests.' },
  Users:              { title: 'Users', icon: 'group', desc: 'View and manage all registered buyers.' },
  Sellers:            { title: 'Sellers', icon: 'store', desc: 'Manage all approved sellers on the platform.' },
  AdminProducts:      { title: 'Products', icon: 'inventory_2', desc: 'Browse and moderate all listed products.' },
  AdminCategories:    { title: 'Categories', icon: 'category', desc: 'Manage product categories.' },
  AdminOrders:        { title: 'Orders', icon: 'shopping_cart', desc: 'Track and manage all platform orders.' },
  Reports:            { title: 'Reports', icon: 'bar_chart', desc: 'View detailed analytics and reports.' },
};

function AdminStubPage({ pageKey }) {
  const { user } = useAuth();
  const userName = user?.name || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();
  const page = stubPages[pageKey];

  return (
    <div className="font-body-md text-on-surface min-h-screen bg-surface flex">
      <Sidebar role="admin" userName={userName} userInitial={userInitial} />
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

export const SellerApplicationsPage = () => <AdminStubPage pageKey="SellerApplications" />;
export const UsersPage = () => <AdminStubPage pageKey="Users" />;
export const SellersPage = () => <AdminStubPage pageKey="Sellers" />;
export const AdminProductsPage = () => <AdminStubPage pageKey="AdminProducts" />;
export const AdminCategoriesPage = () => <AdminStubPage pageKey="AdminCategories" />;
export const AdminOrdersPage = () => <AdminStubPage pageKey="AdminOrders" />;
export const ReportsPage = () => <AdminStubPage pageKey="Reports" />;
