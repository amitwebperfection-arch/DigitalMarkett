import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ShoppingCart, 
  Download, 
  Heart, 
  Wallet,
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  User,
  Award,
  Activity,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

function UserDashboard() {
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-dashboard'],
    queryFn: userService.getDashboard,
    staleTime: 30000
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg font-semibold">Failed to load dashboard</p>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    totalDownloads: 0,
    wishlistCount: 0,
    spentTrend: '+0%'
  };
  
  const recentOrders = data?.recentOrders || [];
  const recentDownloads = data?.recentDownloads || [];
  const walletBalance = data?.walletBalance ?? 0;

  const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);
};

  const quickLinks = [
    {
      title: 'My Orders',
      description: `${stats.totalOrders || 0} total orders`,
      icon: ShoppingCart,
      path: '/user/orders',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Downloads',
      description: `${stats.totalDownloads || 0} products`,
      icon: Download,
      path: '/user/downloads',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Wishlist',
      description: `${stats.wishlistCount || 0} items saved`,
      icon: Heart,
      path: '/user/wishlist',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      title: 'Wallet',
      description: `$${formatCurrency(walletBalance)} balance`,
      icon: Wallet,
      path: '/user/wallet',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  // Stats Cards
  const statsCards = [
    {
      title: 'Total Spent',
      value: `${formatCurrency(stats.totalSpent)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: stats.spentTrend || '+0%'
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: `${stats.activeOrders || 0} pending`
    },
    {
      title: 'Completed',
      value: stats.completedOrders || 0,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'All time'
    },
    {
      title: 'Member Since',
      value: format(new Date(user?.createdAt || Date.now()), 'MMM yyyy'),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'Active member'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Welcome back, {user?.name || 'User'}!
                  </h1>
                  <p className="text-primary-100 mt-1">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm opacity-90">Account Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold capitalize">{user?.role || 'user'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{stat.trend}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Access Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <Link
                  key={idx}
                  to={link.path}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                >
                  <div className={`${link.color} p-6 text-white`}>
                    <Icon className="w-8 h-8 mb-2" />
                    <h3 className="text-xl font-bold mb-1">{link.title}</h3>
                    <p className="text-sm opacity-90">{link.description}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                      View Details →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              </div>
              <Link to="/user/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 4).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Package className="w-4 h-4 text-gray-500" />
                        <p className="font-semibold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                    Start Shopping →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Downloads */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Downloads</h2>
              </div>
              <Link to="/user/downloads" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentDownloads.length > 0 ? (
                recentDownloads.slice(0, 4).map((download) => (
                  <div key={download._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <img
                      src={download.product?.thumbnail || '/placeholder.jpg'}
                      alt={download.product?.title || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        {download.product?.title || 'Untitled Product'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {download.createdAt ? format(new Date(download.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                    {download.product?.files?.[0]?.url && (
                      <a
                        href={download.product.files[0].url}
                        download
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No downloads yet</p>
                  <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                    Browse Products →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Account Management</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link 
              to="/user/profile" 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
            >
              <User className="w-6 h-6 mb-2" />
              <p className="font-semibold">Edit Profile</p>
              <p className="text-sm opacity-90">Update your information</p>
            </Link>
            <Link 
              to="/user/wallet" 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
            >
              <Wallet className="w-6 h-6 mb-2" />
              <p className="font-semibold">Manage Wallet</p>
              <p className="text-sm opacity-90">Add funds & view history</p>
            </Link>
            <Link 
              to="/products" 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
            >
              <Package className="w-6 h-6 mb-2" />
              <p className="font-semibold">Browse Products</p>
              <p className="text-sm opacity-90">Discover new items</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;