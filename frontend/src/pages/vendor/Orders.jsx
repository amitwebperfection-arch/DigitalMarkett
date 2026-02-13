import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vendorService } from '../../services/vendor.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { X, Package, DollarSign, Calendar, User } from 'lucide-react';

// ✅ Order Detail Modal
function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const totalEarnings = order.items?.reduce((sum, item) => sum + (item.vendorEarning || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Order Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Order Date
              </label>
              <p className="font-medium">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Order Number</label>
              <p className="font-medium">#{order.orderNumber || order._id.slice(-6)}</p>
            </div>
          </div>

          {/* Customer */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              Customer
            </label>
            <p className="font-medium">{order.user?.name || 'N/A'}</p>
          </div>

          {/* Products */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <Package className="w-3 h-3" />
              Products ({order.items?.length || 0} items)
            </label>
            <div className="space-y-2 mt-2">
              {order.items?.map((item, idx) => {
                if (!item.product) {
                  return (
                    <div key={idx} className="p-3 bg-red-50 rounded text-red-600 text-sm">
                      Product information unavailable
                    </div>
                  );
                }

                return (
                  <div key={item.product._id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3 flex-1">
                      {item.product.thumbnail && (
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.product.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        ${item.vendorEarning?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500">Your earning</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded">
            <div>
              <label className="text-xs text-gray-500">Total Order</label>
              <p className="text-xl font-bold text-gray-800">${order.total?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Your Earnings</label>
              <p className="text-xl font-bold text-green-600">${totalEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-500">Order Status</label>
            <div className="mt-1">
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  order.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Mobile Order Card
function OrderCard({ order, onView }) {
  const totalEarnings = order.items?.reduce((sum, item) => sum + (item.vendorEarning || 0), 0);
  const productTitles = order.items?.map(item => item.product?.title).filter(Boolean) || [];

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500">
            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
          </p>
          <p className="font-semibold text-sm">
            #{order.orderNumber || order._id.slice(-6)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Your Earnings</p>
          <p className="text-lg font-bold text-green-600">${totalEarnings?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Customer & Products */}
      <div>
        <p className="text-xs text-gray-500">Customer</p>
        <p className="font-medium text-sm">{order.user?.name || 'N/A'}</p>
      </div>

      <div>
        <p className="text-xs text-gray-500">Products</p>
        {productTitles.length > 0 ? (
          <p className="text-sm truncate">
            {productTitles[0]}{productTitles.length > 1 && ` +${productTitles.length - 1} more`}
          </p>
        ) : (
          <p className="text-sm text-red-500">N/A</p>
        )}
      </div>

      {/* Order Total & Status */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-semibold">${order.total?.toFixed(2) || '0.00'}</p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs ${
              order.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {order.status}
          </span>

          <button
            onClick={() => onView(order)}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorOrders() {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', page],
    queryFn: () => vendorService.getOrders({ page, limit: 10 }),
    keepPreviousData: true
  });

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => (
        <span className="whitespace-nowrap text-xs md:text-sm">
          {format(new Date(row.createdAt), 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (row) => (
        <span className="whitespace-nowrap font-medium text-xs md:text-sm">
          #{row.orderNumber || row._id.slice(-6)}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <span className="text-xs md:text-sm">
          {row.user?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'product',
      label: 'Product',
      render: (row) => {
        const titles = row.items?.map(item => item.product?.title) || [];
        if (!titles.length) return <span className="text-xs md:text-sm">N/A</span>;
        if (titles.length === 1) {
          return (
            <span className="text-xs md:text-sm block max-w-[120px] md:max-w-[200px] break-words" title={titles[0]}>
              {titles[0]}
            </span>
          );
        }
        return (
          <span 
            className="text-xs md:text-sm block max-w-[120px] md:max-w-[200px] break-words cursor-help" 
            title={titles.join(', ')}
          >
            {titles[0]} +{titles.length - 1} more
          </span>
        );
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="whitespace-nowrap font-medium text-xs md:text-sm">
          ${row.total?.toFixed(2) || '0.00'}
        </span>
      )
    },
    {
      key: 'commission',
      label: 'Earnings',
      render: (row) => {
        const totalEarnings = row.items?.reduce((sum, item) => sum + (item.vendorEarning || 0), 0);
        return (
          <span className="whitespace-nowrap font-medium text-green-600 text-xs md:text-sm">
            ${totalEarnings?.toFixed(2) || '0.00'}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
          row.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>

      {data?.orders?.length > 0 ? (
        <>
          {/* Mobile: Card View */}
          <div className="md:hidden space-y-3">
            {data.orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onView={setSelectedOrder}
              />
            ))}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden md:block">
            <Table columns={columns} data={data.orders} isLoading={isLoading} />
          </div>

          {data?.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-10">
          No orders found
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

export default VendorOrders;