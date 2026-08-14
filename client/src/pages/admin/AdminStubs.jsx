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
  const page = stubPages[pageKey];

  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary animate-float">
        <span className="material-symbols-outlined text-4xl">{page.icon}</span>
      </div>
      <h1 className="text-2xl font-display font-bold text-text mb-2">{page.title}</h1>
      <p className="text-text-soft max-w-md">{page.desc}</p>
      <p className="text-sm text-text-muted mt-4">This page is under construction. Backend integration coming soon.</p>
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
