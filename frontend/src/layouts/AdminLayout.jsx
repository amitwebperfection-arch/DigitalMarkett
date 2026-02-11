import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const adminMenuItems = [
  { name: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
  { name: 'Users', path: '/admin/users', icon: 'Users' },
  { name: 'Products', path: '/admin/products', icon: 'Package' },
  { name: 'Categories', path: '/admin/categories', icon: 'List' },
  { name: 'Orders', path: '/admin/orders', icon: 'ShoppingCart' },
  { name: 'Vendors', path: '/admin/vendors', icon: 'Store' },
  { name: 'Coupons', path: '/admin/coupons', icon: 'Tag' },
  { name: 'Contact Messages', path: '/admin/contact-messages', icon: 'Mail' },
  { name: 'Payouts', path: '/admin/payouts', icon: 'DollarSign' },
  { name: 'Settings', path: '/admin/settings', icon: 'Settings' },
  {name: 'Support Tickets', path: '/admin/tickets', icon: 'MessageSquare' }
];

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar menuItems={adminMenuItems} />

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <Header title="Admin Dashboard" />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
