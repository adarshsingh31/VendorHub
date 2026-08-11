import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards role-specific routes.
 *
 * Props:
 *   allowedRole  — 'buyer' | 'seller' | 'admin' | undefined (any authenticated user)
 *   children     — the route element to render
 *
 * Behaviour:
 *   1. Not authenticated → redirect to /login
 *   2. Authenticated but wrong role → redirect to the user's own dashboard
 *   3. Correct role → render children
 */
export default function ProtectedRoute({ allowedRole, children }) {
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

  return children;
}
