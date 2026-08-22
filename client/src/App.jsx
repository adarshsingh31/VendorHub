import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Route guard
import ProtectedRoute from "./routes/ProtectedRoute";

// ─── Public pages (small, eagerly loaded for fast first paint) ────────────────
import LandingPage        from "./pages/LandingPage";
import LoginPage          from "./pages/LoginPage";
import SignUpPage         from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPassword      from "./pages/ResetPassword";
import SettingsPage       from "./pages/SettingsPage";

// ─── Admin pages (lazy — only loaded when an admin logs in) ───────────────────
const AdminDashboard         = lazy(() => import("./pages/admin/AdminDashboard"));
const SellerApplicationsPage = lazy(() => import("./pages/admin/AdminStubs").then(m => ({ default: m.SellerApplicationsPage })));
const UsersPage              = lazy(() => import("./pages/admin/AdminStubs").then(m => ({ default: m.UsersPage })));
const SellersPage            = lazy(() => import("./pages/admin/AdminStubs").then(m => ({ default: m.SellersPage })));
const AdminProductsPage      = lazy(() => import("./pages/admin/AdminStubs").then(m => ({ default: m.AdminProductsPage })));
const AdminCategoriesPage    = lazy(() => import("./pages/admin/AdminStubs").then(m => ({ default: m.AdminCategoriesPage })));
const AdminOrdersPage        = lazy(() => import("./pages/admin/AdminStubs").then(m => ({ default: m.AdminOrdersPage })));
const ReportsPage            = lazy(() => import("./pages/admin/AdminStubs").then(m => ({ default: m.ReportsPage })));

// ─── Seller pages (lazy) ──────────────────────────────────────────────────────
const SellerDashboard     = lazy(() => import("./pages/seller/SellerDashboard"));
const SellerOrders        = lazy(() => import("./pages/seller/SellerOrders"));
const SellerOrderDetails  = lazy(() => import("./pages/seller/SellerOrderDetails"));
const ProductSalesDetails = lazy(() => import("./pages/seller/ProductSalesDetails"));
const SellerInventory     = lazy(() => import("./pages/seller/SellerInventory"));
const SellerEarnings      = lazy(() => import("./pages/seller/SellerEarnings"));
const SellerAnalytics     = lazy(() => import("./pages/seller/SellerAnalytics"));
const SellerReviews       = lazy(() => import("./pages/seller/SellerReviews"));
const SellerStoreSettings = lazy(() => import("./pages/seller/SellerStoreSettings"));
const SellerProductsPage  = lazy(() => import("./pages/seller/SellerStubs").then(m => ({ default: m.SellerProductsPage })));
const AddProductPage      = lazy(() => import("./pages/seller/SellerStubs").then(m => ({ default: m.AddProductPage })));
const EditProductPage     = lazy(() => import("./pages/seller/SellerStubs").then(m => ({ default: m.EditProductPage })));

// ─── Buyer pages (lazy) ───────────────────────────────────────────────────────
const BuyerDashboard    = lazy(() => import("./pages/buyer/BuyerDashboard"));
const BecomeSeller      = lazy(() => import("./pages/buyer/BecomeSeller"));
const BuyerProductsPage = lazy(() => import("./pages/buyer/BuyerProductsPage"));
const ProductDetailsPage = lazy(() => import("./pages/buyer/ProductDetailsPage"));
const CartPage          = lazy(() => import("./pages/buyer/CartPage"));
const WishlistPage      = lazy(() => import("./pages/buyer/WishlistPage"));
const CheckoutPage      = lazy(() => import("./pages/buyer/BuyerStubs").then(m => ({ default: m.CheckoutPage })));
const BuyerOrdersPage   = lazy(() => import("./pages/buyer/BuyerStubs").then(m => ({ default: m.BuyerOrdersPage })));
const AddressesPage     = lazy(() => import("./pages/buyer/BuyerStubs").then(m => ({ default: m.AddressesPage })));

import "./index.css";

// ─── Shared page loader ───────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F7F2E7",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "3px solid #E4DBC6",
        borderTopColor: "#E8891E",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public ────────────────────────────────────────────── */}
          <Route path="/"                       element={<LandingPage />} />
          <Route path="/login"                  element={<LoginPage />} />
          <Route path="/signup"                 element={<SignUpPage />} />
          <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token"  element={<ResetPassword />} />

          {/* ── Admin Routes ──────────────────────────────────────── */}
          <Route path="/admin"                       element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/seller-applications"   element={<ProtectedRoute allowedRole="admin"><SellerApplicationsPage /></ProtectedRoute>} />
          <Route path="/admin/users"                 element={<ProtectedRoute allowedRole="admin"><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/sellers"               element={<ProtectedRoute allowedRole="admin"><SellersPage /></ProtectedRoute>} />
          <Route path="/admin/products"              element={<ProtectedRoute allowedRole="admin"><AdminProductsPage /></ProtectedRoute>} />
          <Route path="/admin/categories"            element={<ProtectedRoute allowedRole="admin"><AdminCategoriesPage /></ProtectedRoute>} />
          <Route path="/admin/orders"                element={<ProtectedRoute allowedRole="admin"><AdminOrdersPage /></ProtectedRoute>} />
          <Route path="/admin/reports"               element={<ProtectedRoute allowedRole="admin"><ReportsPage /></ProtectedRoute>} />

          {/* ── Seller Routes ─────────────────────────────────────── */}
          <Route path="/seller"                      element={<ProtectedRoute allowedRole="seller"><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/products"             element={<ProtectedRoute allowedRole="seller"><SellerProductsPage /></ProtectedRoute>} />
          <Route path="/seller/products/add"         element={<ProtectedRoute allowedRole="seller"><AddProductPage /></ProtectedRoute>} />
          <Route path="/seller/products/:id/edit"    element={<ProtectedRoute allowedRole="seller"><EditProductPage /></ProtectedRoute>} />
          <Route path="/seller/inventory"            element={<ProtectedRoute allowedRole="seller"><SellerInventory /></ProtectedRoute>} />
          <Route path="/seller/orders"               element={<ProtectedRoute allowedRole="seller"><SellerOrders /></ProtectedRoute>} />
          <Route path="/seller/orders/product/:productId" element={<ProtectedRoute allowedRole="seller"><ProductSalesDetails /></ProtectedRoute>} />
          <Route path="/seller/orders/:id"           element={<ProtectedRoute allowedRole="seller"><SellerOrderDetails /></ProtectedRoute>} />
          <Route path="/seller/earnings"             element={<ProtectedRoute allowedRole="seller"><SellerEarnings /></ProtectedRoute>} />
          <Route path="/seller/reviews"              element={<ProtectedRoute allowedRole="seller"><SellerReviews /></ProtectedRoute>} />
          <Route path="/seller/analytics"            element={<ProtectedRoute allowedRole="seller"><SellerAnalytics /></ProtectedRoute>} />
          <Route path="/seller/settings"             element={<ProtectedRoute allowedRole="seller"><SellerStoreSettings /></ProtectedRoute>} />

          {/* ── Buyer Routes ───────────────────────────────────────── */}
          <Route path="/buyer"                  element={<ProtectedRoute allowedRole="buyer"><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/buyer/products"         element={<ProtectedRoute allowedRole="buyer"><BuyerProductsPage /></ProtectedRoute>} />
          <Route path="/buyer/products/:id"     element={<ProtectedRoute allowedRole="buyer"><ProductDetailsPage /></ProtectedRoute>} />
          <Route path="/buyer/cart"             element={<ProtectedRoute allowedRole="buyer"><CartPage /></ProtectedRoute>} />
          <Route path="/buyer/checkout"         element={<ProtectedRoute allowedRole="buyer"><CheckoutPage /></ProtectedRoute>} />
          <Route path="/buyer/orders"           element={<ProtectedRoute allowedRole="buyer"><BuyerOrdersPage /></ProtectedRoute>} />
          <Route path="/buyer/wishlist"         element={<ProtectedRoute allowedRole="buyer"><WishlistPage /></ProtectedRoute>} />
          <Route path="/buyer/addresses"        element={<ProtectedRoute allowedRole="buyer"><AddressesPage /></ProtectedRoute>} />
          <Route path="/buyer/become-seller"    element={<ProtectedRoute allowedRole="buyer"><BecomeSeller /></ProtectedRoute>} />

          {/* Settings — accessible by all authenticated roles, uses standard DashboardLayout */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/dashboard"       element={<Navigate to="/buyer" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
