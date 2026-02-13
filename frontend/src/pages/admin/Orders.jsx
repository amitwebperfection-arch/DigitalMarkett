import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MobileCard from '../../components/common/MobileCard';
import DetailModal, { DetailRow } from '../../components/common/DetailModal';
import { format } from 'date-fns';
import { Package, DollarSign, CreditCard, User } from 'lucide-react';

function AdminOrders() {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch orders
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => orderService.getAdminOrders({ page, limit: 10 }),
    keepPreviousData: true
  });

  const handleCardClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Mobile card fields
  const mobileFields = [
    {
      label: 'Date',
      key: 'createdAt',
      render: (order) => (
        <span className="text-sm font-medium">
          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      label: 'Customer',
      key: 'user',
      render: (order) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{order.user?.name || 'N/A'}</span>
        </div>
      )
    },
    {
      label: 'Total',
      key: 'total',
      render: (order) => (
        <div className="flex items-center gap-1">
          <DollarSign size={14} className="text-green-600" />
          <span className="text-sm font-bold text-green-600">
            ${order.total?.toFixed(2)}
          </span>
        </div>
      )
    },
    {
      label: 'Items',
      key: 'items',
      render: (order) => (
        <div className="flex items-center gap-1">
          <Package size={14} className="text-gray-400" />
          <span className="text-sm">{order.items?.length || 0} items</span>
        </div>
      )
    },
    {
      label: 'Status',
      key: 'status',
      render: (order) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            order.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : order.status === 'processing'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {order.status}
        </span>
      )
    }
  ];

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy')
    },
    {
      key: 'user',
      label: 'Customer',
      render: (row) => row.user?.name || 'N/A'
    },
    {
      key: 'items',
      label: 'Items',
      render: (row) => row.items?.length || 0
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => `$${row.total?.toFixed(2)}`
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
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
          className={`px-2 py-1 rounded text-sm ${
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-4 sm:py-6 md:py-8 px-2 sm:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Orders</h1>
          <p className="text-sm text-gray-600 mt-1">{data?.total || 0} total orders</p>
        </div>

        {/* Mobile View - Cards */}
        <div className="lg:hidden space-y-3">
          {data?.orders?.length > 0 ? (
            data.orders.map((order) => (
              <MobileCard
                key={order._id}
                item={order}
                fields={mobileFields}
                onCardClick={handleCardClick}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block">
          <Table columns={columns} data={data?.orders || []} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}

        {/* Detail Modal */}
        <DetailModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Order Details"
        >
          {selectedOrder && (
            <>
              <DetailRow 
                label="Order ID" 
                value={selectedOrder._id} 
              />
              <DetailRow 
                label="Order Date" 
                value={format(new Date(selectedOrder.createdAt), 'PPpp')} 
              />
              <DetailRow 
                label="Customer" 
                value={
                  <div>
                    <p className="font-medium">{selectedOrder.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{selectedOrder.user?.email || ''}</p>
                  </div>
                } 
              />
              <DetailRow 
                label="Total Amount" 
                value={
                  <span className="text-lg font-bold text-green-600">
                    ${selectedOrder.total?.toFixed(2)}
                  </span>
                } 
              />
              <DetailRow 
                label="Payment Status" 
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedOrder.paymentStatus === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                } 
              />
              <DetailRow 
                label="Order Status" 
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedOrder.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedOrder.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                } 
              />
              <DetailRow 
                label="Items" 
                value={
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{item.product?.title || 'Product'}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">${item.price?.toFixed(2)}</p>
                      </div>
                    )) || <p className="text-sm text-gray-500">No items</p>}
                  </div>
                } 
              />
              {selectedOrder.shippingAddress && (
                <DetailRow 
                  label="Shipping Address" 
                  value={
                    <div className="text-sm">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  } 
                />
              )}
            </>
          )}
        </DetailModal>
      </div>
    </div>
  );
}

export default AdminOrders;