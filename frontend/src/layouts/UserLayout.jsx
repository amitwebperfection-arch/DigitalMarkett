import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const userMenuItems = [
  { name: 'Dashboard', path: '/user', icon: 'LayoutDashboard' },
  { name: 'Orders', path: '/user/orders', icon: 'ShoppingCart' },
  { name: 'Downloads', path: '/user/downloads', icon: 'Download' },
  { name: 'Wishlist', path: '/user/wishlist', icon: 'Heart' },
  { name: 'Coupons', path: '/user/coupons', icon: 'Ticket' },
  { name: 'Wallet', path: '/user/wallet', icon: 'Wallet' },
  { name: 'Profile', path: '/user/profile', icon: 'User' },
  { name: 'Support Tickets', path: '/user/tickets', icon: 'MessageSquare' }
];

function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
     
      <Sidebar
        menuItems={userMenuItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      
      <div className="flex flex-col flex-1 lg:ml-64">
        <Header
          title="User Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;