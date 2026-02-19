import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import CheckoutGuard from '../pages/public/Checkout.jsx'; 
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import VendorLayout from '../layouts/VendorLayout';
import UserLayout from '../layouts/UserLayout';
import AuthLayout from '../layouts/AuthLayout';

import LoadingSpinner from '../components/common/LoadingSpinner';

// ============================================
// Public Pages
// ============================================
const Home = lazy(() => import('../pages/public/Home'));
const ProductList = lazy(() => import('../pages/public/ProductList'));
const ProductDetails = lazy(() => import('../pages/public/ProductDetails'));
const Cart = lazy(() => import('../pages/public/Cart'));
const Checkout = lazy(() => import('../pages/public/Checkout'));
const About = lazy(() => import('../pages/public/About'));
const Contact = lazy(() => import('../pages/public/Contact'));
const CmsPage = lazy(() => import('../pages/public/PublicCmsPage.jsx'));


// ============================================
// Auth Pages
// ============================================
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const VendorPendingApproval = lazy(() => import('../pages/auth/VendorPendingApproval'));

// ============================================
// Admin Pages
// ============================================
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminProducts = lazy(() => import('../pages/admin/Products'));
const AdminOrders = lazy(() => import('../pages/admin/Orders'));
const AdminVendors = lazy(() => import('../pages/admin/Vendors'));
const AdminPayouts = lazy(() => import('../pages/admin/Payouts'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));
const Coupons = lazy(() => import('../pages/admin/Coupons'));
const AdminTicketDetailPage = lazy(() => import('../pages/admin/AdminTicketDetailPage'));
const AdminTicketListPage = lazy(() => import('../pages/admin/TicketListPage'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminContactMessages = lazy(() => import('../pages/admin/AdminContactMessages'));
const AdminSystemInfo  = lazy(() => import('../pages/admin/AdminSystemInfo'));
const AdminPages = lazy(() => import('../pages/admin/CmsPages.jsx'));
const AdminAddPage = lazy(() => import('../pages/admin/AddPage'));
const AdminEditPage = lazy(() => import('../pages/admin/EditPage'));


// ============================================
// Vendor Pages
// ============================================
const VendorDashboard = lazy(() => import('../pages/vendor/Dashboard'));
const VendorProducts = lazy(() => import('../pages/vendor/Products'));
const VendorAddProduct = lazy(() => import('../pages/vendor/AddProduct'));
const VendorOrders = lazy(() => import('../pages/vendor/Orders'));
const VendorEarnings = lazy(() => import('../pages/vendor/Earnings'));
const VendorPayouts = lazy(() => import('../pages/vendor/Payouts'));
const VendorReviews = lazy(() => import('../pages/vendor/Reviews'));
const VendorEditProduct = lazy(() => import('../pages/vendor/EditProduct'));
const VendorTicketDetailPage = lazy(() => import('../pages/vendor/TicketDetailPage'));
const VendorTicketListPage = lazy(() => import('../pages/vendor/TicketListPage'));
const VendorProfile = lazy(() => import('../pages/vendor/VendorProfile'));

// ============================================
// User Pages
// ============================================
const UserDashboard = lazy(() => import('../pages/user/Dashboard'));
const UserOrders = lazy(() => import('../pages/user/Orders'));
const UserDownloads = lazy(() => import('../pages/user/Downloads'));
const UserWishlist = lazy(() => import('../pages/user/Wishlist'));
const UserWallet = lazy(() => import('../pages/user/Wallet'));
const UserProfile = lazy(() => import('../pages/user/Profile'));
const TicketsPage = lazy(() => import('../pages/user/TicketsPage'));
const CreateTicketPage = lazy(() => import('../pages/user/CreateTicketPage'));
const TicketDetailPage = lazy(() => import('../pages/user/TicketDetailPage'));
const UserCoupons = lazy(() => import('../pages/user/Coupons'));

// ============================================
// Error Pages
// ============================================
const NotFound = lazy(() => import('../pages/errors/NotFound'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>

        {/* ============================================ */}
        {/* PUBLIC ROUTES                                */}
        {/* ============================================ */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={
              <CheckoutGuard>
                <Checkout />
              </CheckoutGuard>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/:slug" element={<CmsPage />} />
        </Route>

        {/* ============================================ */}
        {/* AUTH ROUTES                                  */}
        {/* ============================================ */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ============================================ */}
        {/* ADMIN ROUTES                                 */}
        {/* ============================================ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="tickets" element={<AdminTicketListPage />} />
          <Route path="tickets/:id" element={<AdminTicketDetailPage />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="contact-messages" element={<AdminContactMessages />} />
          <Route path="systemInfo" element={<AdminSystemInfo />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="pages/new" element={<AdminAddPage />} />
          <Route path="pages/edit/:id" element={<AdminEditPage />} />
        </Route>

        {/* ============================================ */}
        {/* VENDOR ROUTES                                */}
        {/* ============================================ */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/add" element={<VendorAddProduct />} />
          <Route path="products/edit/:id" element={<VendorEditProduct />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="earnings" element={<VendorEarnings />} />
          <Route path="payouts" element={<VendorPayouts />} />
          <Route path="reviews" element={<VendorReviews />} />
          <Route path="tickets" element={<VendorTicketListPage />} />
          <Route path="tickets/new" element={<CreateTicketPage />} /> 
          <Route path="tickets/:id" element={<VendorTicketDetailPage />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="pending-approval" element={<VendorPendingApproval />} />
        </Route>

        {/* ============================================ */}
        {/* USER ROUTES                                  */}
        {/* ============================================ */}
        <Route
          path="/user"
          element={
            <ProtectedRoute roles={['user']}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="downloads" element={<UserDownloads />} />
          <Route path="wishlist" element={<UserWishlist />} />
          <Route path="wallet" element={<UserWallet />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/new" element={<CreateTicketPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="coupons" element={<UserCoupons />} />
        </Route>

        {/* ============================================ */}
        {/* 404 NOT FOUND                                */}
        {/* ============================================ */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
}

export default AppRoutes;