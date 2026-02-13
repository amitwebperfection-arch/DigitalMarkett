import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function AdminPayouts() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionType, setActionType] = useState(null);
  const queryClient = useQueryClient();

  /* ================= FETCH PAYOUTS ================= */
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-payouts', page, statusFilter],
    queryFn: () => adminService.getPayouts({ 
      page, 
      limit: 10,
      status: statusFilter === 'all' ? undefined : statusFilter 
    }),
    keepPreviousData: true
  });

  /* ================= PROCESS PAYOUT ================= */
  const processMutation = useMutation({
    mutationFn: ({ id, status }) =>
      adminService.processPayout(id, { status }),
    onSuccess: (_, variables) => {
      const message = variables.status === 'completed' 
        ? 'Payout approved successfully! ✅' 
        : 'Payout rejected';
      toast.success(message);
      queryClient.invalidateQueries(['admin-payouts']);
      setShowConfirmModal(false);
      setSelectedPayout(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Action failed');
      setShowConfirmModal(false);
    }
  });

  /* ================= HANDLERS ================= */
  const handleAction = (payout, action) => {
    setSelectedPayout(payout);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (selectedPayout && actionType) {
      processMutation.mutate({
        id: selectedPayout._id,
        status: actionType
      });
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      key: 'createdAt',
      label: 'Request Date',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {format(new Date(row.createdAt), 'MMM dd, yyyy')}
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(row.createdAt), 'hh:mm a')}
          </p>
        </div>
      )
    },
    {
      key: 'vendor',
      label: 'Vendor',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.vendor?.name || 'N/A'}
          </p>
          <p className="text-xs text-gray-500">
            {row.vendor?.email || '-'}
          </p>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-bold text-green-600">
          ${Number(row.amount || 0).toFixed(2)}
        </span>
      )
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.method === 'upi' ? (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
              UPI
            </span>
          ) : (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
              Bank Transfer
            </span>
          )}
        </div>
      )
    },
    {
      key: 'accountDetails',
      label: 'Bank Details',
      render: (row) => (
        <div className="text-xs space-y-0.5 sm:space-y-1">
          <p className="font-medium text-gray-900 truncate">
            {row.accountDetails?.accountHolderName || '-'}
          </p>
          <p className="text-gray-600">
            {row.accountDetails?.bankName || '-'}
          </p>
          <p className="text-gray-500">
            AC: ****{row.accountDetails?.accountNumber?.slice(-4) || 'N/A'}
          </p>
          <p className="text-gray-500">
            IFSC: {row.accountDetails?.ifscCode || 'N/A'}
          </p>
          {row.accountDetails?.upiId && (
            <p className="text-purple-600 font-medium">
              UPI: {row.accountDetails.upiId}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          row.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : row.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : row.status === 'processing'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(row, 'completed')}
              disabled={processMutation.isPending}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => handleAction(row, 'rejected')}
              disabled={processMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50"
            >
              ✗ Reject
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            {row.processedAt 
              ? `Processed on ${format(new Date(row.processedAt), 'MMM dd, yyyy')}`
              : '-'
            }
          </div>
        )
    }
  ];

  /* ================= CALCULATE STATS ================= */
  const stats = {
    total: data?.payouts?.length || 0,
    pending: data?.payouts?.filter(p => p.status === 'pending').length || 0,
    completed: data?.payouts?.filter(p => p.status === 'completed').length || 0,
    totalAmount: data?.payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  };

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <>
      <div className="container-custom py-8 px-0 md:px-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Payouts</h1>
            <p className="text-gray-600 mt-1">Manage and process vendor payout requests</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-5 md:p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium mb-1">Total Requests</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-200 p-2 sm:p-3 rounded-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-purple-900">
                  ${stats.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'pending', 'completed', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payout Requests
            </h2>
            {isFetching && (
              <LoadingSpinner size="sm" />
            )}
          </div>

          {data?.payouts && data.payouts.length > 0 ? (
            <>
              <Table
                columns={columns}
                data={data.payouts}
                isLoading={isFetching}
              />

              {data?.pages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={data.pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payouts Found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'No payout requests yet'
                  : `No ${statusFilter} payouts`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== CONFIRMATION MODAL ===== */}
      {showConfirmModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${
              actionType === 'completed' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {actionType === 'completed' ? (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            <h3 className="text-xl font-bold text-center mb-2">
              {actionType === 'completed' ? 'Approve Payout?' : 'Reject Payout?'}
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              {actionType === 'completed' 
                ? 'Are you sure you want to approve this payout request?'
                : 'Are you sure you want to reject this payout request?'
              }
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Vendor:</span>
                <span className="font-medium">{selectedPayout.vendor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600">${selectedPayout.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-medium">****{selectedPayout.accountDetails?.accountNumber?.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bank:</span>
                <span className="font-medium">{selectedPayout.accountDetails?.bankName}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedPayout(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                disabled={processMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 ${
                  actionType === 'completed'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={processMutation.isPending}
              >
                {processMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Processing...
                  </span>
                ) : (
                  actionType === 'completed' ? 'Approve' : 'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPayouts;