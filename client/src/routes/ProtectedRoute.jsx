import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';

/**
 * ProtectedRoute — guards role-specific routes.
 *
 * Props:
 *   allowedRole  — 'buyer' | 'seller' | 'admin' | undefined (any authenticated user)
 *   noLayout     — if true, skips the DashboardLayout wrapper (for pages with own layout)
 *   children     — the route element to render
 *
 * Behaviour:
 *   1. Not authenticated → redirect to /login
 *   2. Authenticated but wrong role → redirect to the user's own dashboard
 *   3. Correct role → render children (inside DashboardLayout unless noLayout=true)
 */
export default function ProtectedRoute({ allowedRole, noLayout, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect to the correct dashboard for the user's actual role
    const dashboardMap = { buyer: '/buyer', seller: '/seller', admin: '/admin' };
    return <Navigate to={dashboardMap[role] || '/login'} replace />;
  }

  if (noLayout) {
    return children;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}

