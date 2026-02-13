import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vendorService } from '../../services/vendor.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function VendorEarnings() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-earnings', page],
    queryFn: () => vendorService.getEarnings({ page, limit: 20 }),
    keepPreviousData: true
  });

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) => format(new Date(row.date), 'MMM dd, yyyy')
    },
    { key: 'productName', label: 'Product' },
    {
      key: 'amount',
      label: 'Amount ($)',
      render: (row) => row.amount?.toFixed(2)
    }
  ];

  const totalEarnings = data?.earnings?.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2) || '0.00';

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container-custom py-8 px-0 md:px-4">
      <h1 className="text-3xl font-bold mb-6">Earnings</h1>

      {/* Total Earnings */}
      <div className="mb-6 p-6 bg-white rounded shadow flex items-center justify-between">
        <span className="text-lg font-medium">Total Earnings</span>
        <span className="text-2xl font-bold">${totalEarnings}</span>
      </div>

      {/* Earnings History Table */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Earnings History</h2>

        <Table columns={columns} data={data?.earnings || []} />

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={data.pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorEarnings;
