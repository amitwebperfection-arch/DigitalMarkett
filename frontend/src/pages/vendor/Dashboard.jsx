import { useQuery } from '@tanstack/react-query';
import { vendorService } from '../../services/vendor.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useUserRefresh } from '../../hooks/useUserRefresh';
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Star,
  Download,
  Eye,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function VendorDashboard() {
  useUserRefresh();
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: vendorService.getDashboard
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentSales = data?.recentSales || [];
  const topProducts = data?.topProducts || [];
  const earningsChart = data?.earningsChart || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const pendingPayouts = data?.pendingPayouts || 0;

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalEarnings?.toFixed(2) || '0.00'}`,
      change: stats.revenueChange || 0,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      trend: stats.revenueChange >= 0 ? 'up' : 'down'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      subtext: `${stats.activeProducts || 0} active`,
      icon: Package,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Total Sales',
      value: stats.totalSales || 0,
      change: stats.salesChange || 0,
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      trend: stats.salesChange >= 0 ? 'up' : 'down'
    },
    {
      title: 'Average Rating',
      value: (stats.averageRating || 0).toFixed(1),
      subtext: `${stats.totalReviews || 0} reviews`,
      icon: Star,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    },
    {
      title: 'Total Downloads',
      value: stats.totalDownloads || 0,
      change: stats.downloadsChange || 0,
      icon: Download,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      trend: stats.downloadsChange >= 0 ? 'up' : 'down'
    },
    {
      title: 'Pending Payouts',
      value: `$${pendingPayouts.toFixed(2)}`,
      icon: AlertCircle,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      link: '/vendor/payouts'
    }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8 px-0 md:px-4 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(), 'MMMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              {stat.link ? (
                <Link to={stat.link} className="block p-6">
                  <StatCardContent stat={stat} />
                </Link>
              ) : (
                <div className="p-6">
                  <StatCardContent stat={stat} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Revenue Overview (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#888"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Products by Category
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-500" />
                Recent Sales
              </h2>
              <Link 
                to="/vendor/orders" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </Link>
            </div>

            {recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div 
                    key={sale._id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {sale.customer?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {sale.customer?.name || 'Unknown Customer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sale.itemCount} item(s) • {format(new Date(sale.date), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${sale.amount.toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        sale.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sale.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No sales yet</p>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Top Performing Products
              </h2>
              <Link 
                to="/vendor/products" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </Link>
            </div>

            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div 
                    key={product._id} 
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        #{index + 1}
                      </div>
                    </div>
                    
                    {product.thumbnail ? (
                      <img 
                        src={product.thumbnail} 
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {product.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {product.downloads || 0}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {product.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${product.price?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        ${product.totalEarnings?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No products yet</p>
                <Link 
                  to="/vendor/products/add" 
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first product →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/vendor/products/add"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <Package className="w-8 h-8 mb-2" />
              <p className="font-semibold">Add Product</p>
              <p className="text-sm text-white/80">Upload new digital product</p>
            </Link>
            
            <Link 
              to="/vendor/orders"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <ShoppingCart className="w-8 h-8 mb-2" />
              <p className="font-semibold">View Orders</p>
              <p className="text-sm text-white/80">Check recent sales</p>
            </Link>
            
            <Link 
              to="/vendor/payouts"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <DollarSign className="w-8 h-8 mb-2" />
              <p className="font-semibold">Payouts</p>
              <p className="text-sm text-white/80">Request withdrawal</p>
            </Link>
            
            <Link 
              to="/vendor/reviews"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <Star className="w-8 h-8 mb-2" />
              <p className="font-semibold">Reviews</p>
              <p className="text-sm text-white/80">Customer feedback</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Content Component
function StatCardContent({ stat }) {
  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <stat.icon className="w-6 h-6" />
        </div>
        {stat.trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            stat.trend === 'up' ? 'text-white' : 'text-white/80'
          }`}>
            {stat.trend === 'up' ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
            <span>{Math.abs(stat.change)}%</span>
          </div>
        )}
      </div>
      <div className="text-sm font-medium opacity-90 mb-1">
        {stat.title}
      </div>
      <div className="text-3xl font-bold mb-1">
        {stat.value}
      </div>
      {stat.subtext && (
        <div className="text-sm opacity-75">
          {stat.subtext}
        </div>
      )}
    </div>
  );
}

export default VendorDashboard;