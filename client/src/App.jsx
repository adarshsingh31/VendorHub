import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPassword from "./pages/ResetPassword";

// Route guard
import ProtectedRoute from "./routes/ProtectedRoute";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import {
  SellerApplicationsPage,
  UsersPage,
  SellersPage,
  AdminProductsPage,
  AdminCategoriesPage,
  AdminOrdersPage,
  ReportsPage,
} from "./pages/admin/AdminStubs";

// Seller pages
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerOrderDetails from "./pages/seller/SellerOrderDetails";
import ProductSalesDetails from "./pages/seller/ProductSalesDetails";
import {
  SellerProductsPage,
  AddProductPage,
  EditProductPage,
  SellerEarningsPage,
  SellerReviewsPage,
  SellerAnalyticsPage,
  SellerSettingsPage,
} from "./pages/seller/SellerStubs";
import SellerInventory from "./pages/seller/SellerInventory";
import SellerEarnings from "./pages/seller/SellerEarnings";
import SellerAnalytics from "./pages/seller/SellerAnalytics";
import SellerReviews from "./pages/seller/SellerReviews";
import SellerStoreSettings from "./pages/seller/SellerStoreSettings";

// Buyer pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BecomeSeller from "./pages/buyer/BecomeSeller";
import BuyerProductsPage from "./pages/buyer/BuyerProductsPage";
import ProductDetailsPage from "./pages/buyer/ProductDetailsPage";
import CartPage from "./pages/buyer/CartPage";
import WishlistPage from "./pages/buyer/WishlistPage";
import {
  CheckoutPage,
  BuyerOrdersPage,
  AddressesPage,
} from "./pages/buyer/BuyerStubs";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ── Admin Routes ────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/seller-applications"
          element={
            <ProtectedRoute allowedRole="admin">
              <SellerApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="admin">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sellers"
          element={
            <ProtectedRoute allowedRole="admin">
              <SellersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRole="admin">
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* ── Seller Routes ────────────────────────────────────────── */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products/add"
          element={
            <ProtectedRoute allowedRole="seller">
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products/:id/edit"
          element={
            <ProtectedRoute allowedRole="seller">
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/inventory"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders/product/:productId"
          element={
            <ProtectedRoute allowedRole="seller">
              <ProductSalesDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders/:id"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerOrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/earnings"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerEarnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/reviews"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/analytics"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/settings"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerStoreSettings />
            </ProtectedRoute>
          }
        />

        {/* ── Buyer Routes ─────────────────────────────────────────── */}
        <Route
          path="/buyer"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/products"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/products/:id"
          element={
            <ProtectedRoute allowedRole="buyer">
              <ProductDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/cart"
          element={
            <ProtectedRoute allowedRole="buyer">
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/checkout"
          element={
            <ProtectedRoute allowedRole="buyer">
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/orders"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/wishlist"
          element={
            <ProtectedRoute allowedRole="buyer">
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/addresses"
          element={
            <ProtectedRoute allowedRole="buyer">
              <AddressesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/become-seller"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BecomeSeller />
            </ProtectedRoute>
          }
        />

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/buyer" replace />} />
        <Route
          path="/admin-dashboard"
          element={<Navigate to="/admin" replace />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
