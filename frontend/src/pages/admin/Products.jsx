import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

function AdminProducts() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending'); 
  const queryClient = useQueryClient();

  // Fetch products based on status filter
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, statusFilter],
    queryFn: () => {
      const params = { page, limit: 10 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      return productService.getProducts(params);
    },
    keepPreviousData: true
  });

  // Approve product mutation
  const approveMutation = useMutation({
    mutationFn: productService.approveProduct,
    onSuccess: () => {
      toast.success('Product approved successfully');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve product');
    }
  });

  // Reject product mutation
  const rejectMutation = useMutation({
    mutationFn: productService.rejectProduct,
    onSuccess: () => {
      toast.success('Product rejected successfully');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject product');
    }
  });

  const columns = [
    {
      key: 'thumbnail',
      label: 'Image',
      render: (row) => (
        <img
          src={row.thumbnail || '/placeholder.jpg'}
          alt={row.title}
          className="w-16 h-16 object-cover rounded-lg border"
        />
      )
    },
    { 
      key: 'title', 
      label: 'Title',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-500">{row.category}</p>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 line-through">${row.price?.toFixed(2) || '0.00'}</p>
          {row.salePrice && (
            <p className="text-xs text-green-600 ">${row.salePrice.toFixed(2)}</p>
          )}
        </div>
      )
    },
    {
      key: 'vendor',
      label: 'Vendor',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{row.vendor?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{row.vendor?.email || ''}</p>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {format(new Date(row.createdAt), 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : row.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => approveMutation.mutate(row._id)}
                disabled={approveMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                title="Approve Product"
              >
                <CheckCircle className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => rejectMutation.mutate(row._id)}
                disabled={rejectMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                title="Reject Product"
              >
                <XCircle className="w-3 h-3" />
                Reject
              </button>
            </>
          )}
          <a
            href={`/products/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
            title="View Product"
          >
            <Eye className="w-3 h-3" />
            View
          </a>
        </div>
      )
    }
  ];

  // Stats for each status
  const stats = [
    {
      label: 'Pending',
      value: 'pending',
      count: data?.pendingCount || 0,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    },
    {
      label: 'Approved',
      value: 'approved',
      count: data?.approvedCount || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-300'
    },
    {
      label: 'Rejected',
      value: 'rejected',
      count: data?.rejectedCount || 0,
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-300'
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-gray-600 mt-1">Review and manage all products on the platform</p>
        </div>

        {/* Status Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isActive = statusFilter === stat.value;
            return (
              <button
                key={stat.value}
                onClick={() => {
                  setStatusFilter(stat.value);
                  setPage(1);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                    : `border-transparent ${stat.color} hover:shadow-md hover:scale-102`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                  {isActive && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-sm font-medium">{stat.label}</p>
              </button>
            );
          })}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {statusFilter === 'all' ? 'All Products' : 
                   statusFilter === 'pending' ? 'Pending Products' :
                   statusFilter === 'approved' ? 'Approved Products' :
                   'Rejected Products'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {data?.total || 0} product{data?.total !== 1 ? 's' : ''} found
                </p>
              </div>
              
              {/* Mobile Dropdown Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Products</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {data?.products?.length > 0 ? (
            <>
              <Table columns={columns} data={data.products} isLoading={isLoading} />
              
              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <Pagination
                    currentPage={page}
                    totalPages={data.totalPages}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {statusFilter === 'all' ? '' : statusFilter} products found
              </h3>
              <p className="text-gray-500">
                {statusFilter === 'pending' 
                  ? 'There are no products waiting for approval.'
                  : statusFilter === 'approved'
                  ? 'No products have been approved yet.'
                  : statusFilter === 'rejected'
                  ? 'No products have been rejected yet.'
                  : 'No products available.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;