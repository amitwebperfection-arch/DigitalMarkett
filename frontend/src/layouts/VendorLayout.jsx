import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const vendorMenuItems = [
  { name: 'Dashboard', path: '/vendor', icon: 'LayoutDashboard' },
  { name: 'Products', path: '/vendor/products', icon: 'Package' },
  { name: 'Add Product', path: '/vendor/products/add', icon: 'Plus' },
  { name: 'Orders', path: '/vendor/orders', icon: 'ShoppingCart' },
  { name: 'Earnings', path: '/vendor/earnings', icon: 'DollarSign' },
  { name: 'Payouts', path: '/vendor/payouts', icon: 'Wallet' },
  { name: 'Reviews', path: '/vendor/reviews', icon: 'Star' },
  { name: 'Profile', path: '/vendor/profile', icon: 'User' },
  { name: 'Support Tickets', path: '/vendor/tickets', icon: 'MessageSquare' }
];

function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <Sidebar
        menuItems={vendorMenuItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      
      <div className="flex flex-col flex-1 lg:ml-64">
        <Header
          title="Vendor Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default VendorLayout;