import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

function UserOrders() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['user-orders', page],
    queryFn: () => userService.getMyOrders({ page, limit: 10 }),
    keepPreviousData: true
  });

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy')
    },
    {
      key: 'items',
      label: 'Items',
      render: (row) => row.items?.length || 0
    },
    {
      key: 'products',
      label: 'Products',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.items?.map((item, idx) => {
            // Check if product exists
            if (!item.product) {
              return (
                <span key={idx} className="text-red-500">
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
                    className="w-6 h-6 object-cover rounded"
                  />
                )}
                <span>{`${item.product.title} x${item.quantity || 1}`}</span>
              </div>
            );
          })}
        </div>
      )
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


  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <Table columns={columns} data={data?.orders || []} isLoading={isLoading} />

      {data?.pages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={data.pages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

export default UserOrders;
