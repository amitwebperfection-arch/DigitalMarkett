import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vendorService } from '../../services/vendor.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

function VendorOrders() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', page],
    queryFn: () => vendorService.getOrders({ page, limit: 10 }),
    keepPreviousData: true
  });

  const columns = [
  {
    key: 'createdAt',
    label: 'Date',
    render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy')
  },
  {
    key: 'orderNumber',
    label: 'Order #',
    render: (row) => `#${row.orderNumber || row._id.slice(-6)}`
  },
  {
    key: 'customer',
    label: 'Customer',
    render: (row) => row.user?.name || 'N/A'
  },
  {
  key: 'product',
  label: 'Product',
  render: (row) => {
    const titles = row.items?.map(item => item.product?.title) || [];
    if (!titles.length) return 'N/A';
    if (titles.length === 1) return titles[0];
    return (
      <span title={titles.join(', ')}>
        {titles[0]} +{titles.length - 1} more
      </span>
    );
  }
},
  {
    key: 'amount',
    label: 'Amount',
    render: (row) => `$${row.total?.toFixed(2) || '0.00'}`
  },
  {
    key: 'commission',
    label: 'Your Earnings',
    render: (row) => {
      const totalEarnings = row.items?.reduce((sum, item) => sum + (item.vendorEarning || 0), 0);
      return `$${totalEarnings?.toFixed(2) || '0.00'}`;
    }
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span className={`px-2 py-1 rounded text-sm ${
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
    <div className="container-custom py-8 space-y-6">
      <h1 className="text-3xl font-bold">My Orders</h1>

      <Table columns={columns} data={data?.orders || []} isLoading={isLoading} />

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

export default VendorOrders;