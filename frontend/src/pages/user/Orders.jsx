import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { X, Package, DollarSign, Calendar } from 'lucide-react';

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

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
          {/* Date */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Order Date
            </label>
            <p className="font-medium">{format(new Date(order.createdAt), 'MMM dd, yyyy - hh:mm a')}</p>
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
                      Deleted Product
                    </div>
                  );
                }

                return (
                  <div key={item.product._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    {item.product.thumbnail && (
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.title}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity || 1}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded">
            <div>
              <label className="text-xs text-gray-500">Total Amount</label>
              <p className="text-2xl font-bold text-green-600">${order.total?.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Items</label>
              <p className="text-2xl font-bold">{order.items?.length || 0}</p>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Payment Status</label>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    order.paymentStatus === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
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
    </div>
  );
}

// ✅ Mobile Order Card
function OrderCard({ order, onView }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500">
            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
          </p>
          <p className="font-semibold text-sm">{order.items?.length || 0} Items</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">${order.total?.toFixed(2)}</p>
        </div>
      </div>

      {/* Products Preview */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {order.items?.slice(0, 3).map((item, idx) => {
          if (!item.product) return null;
          return (
            <img
              key={idx}
              src={item.product.thumbnail}
              alt={item.product.title}
              className="w-12 h-12 object-cover rounded flex-shrink-0"
            />
          );
        })}
        {order.items?.length > 3 && (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
            +{order.items.length - 3}
          </div>
        )}
      </div>

      {/* Status & Action */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded text-xs ${
              order.paymentStatus === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {order.paymentStatus}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs ${
              order.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {order.status}
          </span>
        </div>

        <button
          onClick={() => onView(order)}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

function UserOrders() {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['user-orders', page],
    queryFn: () => userService.getMyOrders({ page, limit: 10 }),
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
      key: 'items',
      label: 'Items',
      render: (row) => (
        <span className="text-xs md:text-sm">
          {row.items?.length || 0}
        </span>
      )
    },
    {
      key: 'products',
      label: 'Products',
      render: (row) => (
        <div className="flex flex-col gap-2 min-w-[150px] md:min-w-[200px]">
          {row.items?.map((item, idx) => {
            if (!item.product) {
              return (
                <span key={idx} className="text-red-500 text-xs">
                  Deleted Product
                </span>
              );
            }

            return (
              <div key={item.product._id} className="flex items-center gap-2">
                {item.product.thumbnail && (
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.title}
                    className="w-6 h-6 object-cover rounded flex-shrink-0"
                  />
                )}
                <span className="text-xs md:text-sm break-words max-w-[100px] md:max-w-[180px]">
                  {`${item.product.title} x${item.quantity || 1}`}
                </span>
              </div>
            );
          })}
        </div>
      )
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => (
        <span className="whitespace-nowrap font-medium text-xs md:text-sm">
          ${row.total?.toFixed(2)}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
            row.paymentStatus === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.paymentStatus}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
            row.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status}
        </span>
      )
    }
  ];

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="py-4 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">My Orders</h1>

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

          {data?.pages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={data.pages}
                onPageChange={setPage}
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

export default UserOrders;