import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

function AdminOrders() {
  const [page, setPage] = useState(1);

  // Fetch orders
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => orderService.getAdminOrders({ page, limit: 10 }),
    keepPreviousData: true
  });

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
    <div className="container-custom py-8 space-y-6">
      <h1 className="text-3xl font-bold">All Orders</h1>

      {/* Orders Table */}
      <Table columns={columns} data={data?.orders || []} isLoading={isLoading} />

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
}

export default AdminOrders;
