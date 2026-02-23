import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from '../../services/admin.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MobileCard from '../../components/common/MobileCard';
import DetailModal, { DetailRow } from '../../components/common/DetailModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Check, X, Eye, User, Mail, Briefcase, DollarSign, Package, Shield, Ban, CheckCircle } from 'lucide-react';

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
      setShowModal(false);
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
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to activate vendor');
    }
  });

  const handleCardClick = (vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  // Mobile card fields
  const mobileFields = [
    {
      label: 'Name',
      key: 'name',
      render: (vendor) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="font-medium">{vendor.name}</span>
        </div>
      )
    },
    {
      label: 'Business',
      key: 'vendorInfo.businessName',
      render: (vendor) => (
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-gray-400" />
          <span className="text-sm">{vendor.vendorInfo?.businessName || 'N/A'}</span>
        </div>
      )
    },
    {
      label: 'Application',
      key: 'vendorInfo.status',
      render: (vendor) => {
        const status = vendor.vendorInfo?.status || 'N/A';
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      label: 'Products',
      key: 'productsCount',
      render: (vendor) => (
        <div className="flex items-center gap-1">
          <Package size={14} className="text-gray-400" />
          <span className="text-sm">{vendor.productsCount || 0}</span>
        </div>
      )
    },
    {
      label: 'Earnings',
      key: 'totalEarnings',
      render: (vendor) => (
        <div className="flex items-center gap-1">
          <DollarSign size={14} className="text-green-600" />
          <span className="text-sm font-semibold text-green-600">${vendor.totalEarnings?.toFixed(2) || '0.00'}</span>
        </div>
      )
    }
  ];

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
            onClick={() => handleCardClick(row)}
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
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-4 sm:py-6 md:py-8 px-2 sm:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Vendors</h1>
            <p className="text-sm text-gray-600 mt-1">{data?.vendors?.length || 0} total vendors</p>
          </div>
          <div className="flex gap-2 text-xs sm:text-sm">
            <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded whitespace-nowrap">
              Pending: {data?.vendors?.filter(v => v.vendorInfo?.status === 'pending').length || 0}
            </span>
            <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded whitespace-nowrap">
              Approved: {data?.vendors?.filter(v => v.role === 'vendor').length || 0}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors by name or business..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Mobile View - Cards */}
        <div className="lg:hidden space-y-3">
          {data?.vendors?.length > 0 ? (
            data.vendors.map((vendor) => (
              <MobileCard
                key={vendor._id}
                item={vendor}
                fields={mobileFields}
                onCardClick={handleCardClick}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No vendors found</p>
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block">
          <Table columns={columns} data={data?.vendors || []} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}

        {/* Vendor Details Modal */}
        <DetailModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Vendor Details"
          actions={
            <>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              {selectedVendor?.vendorInfo?.status === 'pending' && (
                <>
                  <button
                    onClick={() => approveMutation.mutate(selectedVendor._id)}
                    disabled={approveMutation.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(selectedVendor._id)}
                    disabled={rejectMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    <X size={16} />
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </button>
                </>
              )}
              {selectedVendor?.role === 'vendor' && selectedVendor.isActive && (
                <button
                  onClick={() => suspendMutation.mutate(selectedVendor._id)}
                  disabled={suspendMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <Ban size={16} />
                  {suspendMutation.isPending ? 'Suspending...' : 'Suspend'}
                </button>
              )}
              {selectedVendor?.role === 'vendor' && !selectedVendor.isActive && (
                <button
                  onClick={() => activateMutation.mutate(selectedVendor._id)}
                  disabled={activateMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  {activateMutation.isPending ? 'Activating...' : 'Activate'}
                </button>
              )}
            </>
          }
        >
          {selectedVendor && (
            <>
              <DetailRow 
                label="Vendor ID" 
                value={selectedVendor._id} 
              />
              <DetailRow 
                label="Name" 
                value={selectedVendor.name} 
              />
              <DetailRow 
                label="Email" 
                value={
                  <a 
                    href={`mailto:${selectedVendor.email}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {selectedVendor.email}
                  </a>
                } 
              />
              <DetailRow 
                label="Business Name" 
                value={selectedVendor.vendorInfo?.businessName || 'N/A'} 
              />
              {selectedVendor.vendorInfo?.description && (
                <DetailRow 
                  label="Description" 
                  value={
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                      {selectedVendor.vendorInfo.description}
                    </div>
                  } 
                />
              )}
              <DetailRow 
                label="Application Status" 
                value={
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedVendor.vendorInfo?.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedVendor.vendorInfo?.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedVendor.vendorInfo?.status?.charAt(0).toUpperCase() + 
                     selectedVendor.vendorInfo?.status?.slice(1) || 'N/A'}
                  </span>
                } 
              />
              <DetailRow 
                label="Role" 
                value={
                  <span className="capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {selectedVendor.role}
                  </span>
                } 
              />
              <DetailRow 
                label="Account Status" 
                value={
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedVendor.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedVendor.isActive ? 'Active' : 'Suspended'}
                  </span>
                } 
              />
              <DetailRow 
                label="Applied At" 
                value={
                  selectedVendor.vendorInfo?.appliedAt 
                    ? format(new Date(selectedVendor.vendorInfo.appliedAt), 'PPpp')
                    : 'N/A'
                } 
              />
              {selectedVendor.vendorInfo?.approvedAt && (
                <DetailRow 
                  label="Approved At" 
                  value={format(new Date(selectedVendor.vendorInfo.approvedAt), 'PPpp')} 
                />
              )}
              <DetailRow 
                label="Member Since" 
                value={format(new Date(selectedVendor.createdAt), 'PPpp')} 
              />
              <DetailRow 
                label="Total Products" 
                value={
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-gray-400" />
                    <span className="font-semibold">{selectedVendor.productsCount || 0}</span>
                  </div>
                } 
              />
              <DetailRow 
                label="Total Earnings" 
                value={
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      ${selectedVendor.totalEarnings?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                } 
              />
            </>
          )}
        </DetailModal>
      </div>
    </div>
  );
}

export default AdminVendors;