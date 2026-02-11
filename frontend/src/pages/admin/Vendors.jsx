import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Check, X, Eye } from 'lucide-react';

function AdminVendors() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors', page, search],
    queryFn: () => adminService.getVendors({ page, limit: 10, search }),
    keepPreviousData: true
  });

  const approveMutation = useMutation({
    mutationFn: adminService.approveVendor,
    onSuccess: () => {
      toast.success('Vendor approved successfully');
      queryClient.invalidateQueries(['admin-vendors']);
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve vendor');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: adminService.rejectVendor,
    onSuccess: () => {
      toast.success('Vendor application rejected');
      queryClient.invalidateQueries(['admin-vendors']);
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject vendor');
    }
  });

  const suspendMutation = useMutation({
    mutationFn: adminService.suspendVendor,
    onSuccess: () => {
      toast.success('Vendor suspended');
      queryClient.invalidateQueries(['admin-vendors']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to suspend vendor');
    }
  });

  const activateMutation = useMutation({
    mutationFn: adminService.approveVendor,
    onSuccess: () => {
      toast.success('Vendor activated');
      queryClient.invalidateQueries(['admin-vendors']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to activate vendor');
    }
  });

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'vendorInfo.businessName',
      label: 'Business',
      render: (row) => row.vendorInfo?.businessName || 'N/A'
    },
    {
      key: 'vendorInfo.status',
      label: 'Application Status',
      render: (row) => {
        const status = row.vendorInfo?.status || 'N/A';
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded text-sm ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-sm ${
          row.role === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Account Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-sm ${
          row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.isActive ? 'Active' : 'Suspended'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy')
    },
    {
      key: 'productsCount',
      label: 'Products',
      render: (row) => row.productsCount || 0
    },
    {
      key: 'totalEarnings',
      label: 'Earnings',
      render: (row) => `$${row.totalEarnings?.toFixed(2) || '0.00'}`
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="text-blue-600 hover:underline text-sm"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {row.vendorInfo?.status === 'pending' && (
            <>
              <button
                onClick={() => approveMutation.mutate(row._id)}
                className="text-green-600 hover:underline text-sm"
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => rejectMutation.mutate(row._id)}
                className="text-red-600 hover:underline text-sm"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}

          {row.role === 'vendor' && row.isActive && (
            <button
              onClick={() => suspendMutation.mutate(row._id)}
              className="text-orange-600 hover:underline text-sm"
            >
              Suspend
            </button>
          )}

          {row.role === 'vendor' && !row.isActive && (
            <button
              onClick={() => activateMutation.mutate(row._id)}
              className="text-green-600 hover:underline text-sm"
            >
              Activate
            </button>
          )}
        </div>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Vendors</h1>
        <div className="flex gap-4">
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">
              Pending: {data?.vendors?.filter(v => v.vendorInfo?.status === 'pending').length || 0}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
              Approved: {data?.vendors?.filter(v => v.role === 'vendor').length || 0}
            </span>
          </div>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search vendors..."
        className="input w-full max-w-sm"
      />

      <Table columns={columns} data={data?.vendors || []} isLoading={isLoading} />

      {data?.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Vendor Details Modal */}
      {showModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Vendor Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-medium text-gray-700">Name:</label>
                <p className="text-gray-900">{selectedVendor.name}</p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Email:</label>
                <p className="text-gray-900">{selectedVendor.email}</p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Business Name:</label>
                <p className="text-gray-900">{selectedVendor.vendorInfo?.businessName || 'N/A'}</p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Description:</label>
                <p className="text-gray-900">{selectedVendor.vendorInfo?.description || 'N/A'}</p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Application Status:</label>
                <p className="text-gray-900">
                  {selectedVendor.vendorInfo?.status?.charAt(0).toUpperCase() + 
                   selectedVendor.vendorInfo?.status?.slice(1) || 'N/A'}
                </p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Applied At:</label>
                <p className="text-gray-900">
                  {selectedVendor.vendorInfo?.appliedAt 
                    ? format(new Date(selectedVendor.vendorInfo.appliedAt), 'PPpp')
                    : 'N/A'}
                </p>
              </div>

              {selectedVendor.vendorInfo?.approvedAt && (
                <div>
                  <label className="font-medium text-gray-700">Approved At:</label>
                  <p className="text-gray-900">
                    {format(new Date(selectedVendor.vendorInfo.approvedAt), 'PPpp')}
                  </p>
                </div>
              )}

              <div>
                <label className="font-medium text-gray-700">Total Products:</label>
                <p className="text-gray-900">{selectedVendor.productsCount || 0}</p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Total Earnings:</label>
                <p className="text-gray-900">${selectedVendor.totalEarnings?.toFixed(2) || '0.00'}</p>
              </div>

              {selectedVendor.vendorInfo?.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => approveMutation.mutate(selectedVendor._id)}
                    disabled={approveMutation.isLoading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {approveMutation.isLoading ? 'Approving...' : 'Approve Application'}
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(selectedVendor._id)}
                    disabled={rejectMutation.isLoading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {rejectMutation.isLoading ? 'Rejecting...' : 'Reject Application'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVendors;