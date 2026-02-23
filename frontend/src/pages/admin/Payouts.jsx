import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, DollarSign, FileText, Banknote } from 'lucide-react';

function AdminPayouts() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionType, setActionType] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-payouts', page, statusFilter],
    queryFn: () => adminService.getPayouts({
      page,
      limit: 10,
      status: statusFilter === 'all' ? undefined : statusFilter
    }),
    keepPreviousData: true
  });

  const processMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.processPayout(id, { status }),
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'completed' ? 'Payout approved! ✅' : 'Payout rejected');
      queryClient.invalidateQueries(['admin-payouts']);
      setShowConfirmModal(false);
      setSelectedPayout(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Action failed');
      setShowConfirmModal(false);
    }
  });

  const handleAction = (payout, action) => {
    setSelectedPayout(payout);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (selectedPayout && actionType) {
      processMutation.mutate({ id: selectedPayout._id, status: actionType });
    }
  };

  const stats = {
    total: data?.payouts?.length || 0,
    pending: data?.payouts?.filter(p => p.status === 'pending').length || 0,
    completed: data?.payouts?.filter(p => p.status === 'completed').length || 0,
    totalAmount: data?.payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  };

  const StatusBadge = ({ status }) => {
    const map = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  // Mobile Card Component
  const PayoutCard = ({ row }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{row.vendor?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{row.vendor?.email || '-'}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-0.5">Amount</p>
          <p className="font-bold text-green-600">${Number(row.amount || 0).toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-0.5">Method</p>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${row.method === 'upi' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {row.method === 'upi' ? 'UPI' : 'Bank'}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Account Holder</span>
          <span className="font-medium text-gray-900">{row.accountDetails?.accountHolderName || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Bank</span>
          <span className="text-gray-700">{row.accountDetails?.bankName || '-'}</span>
        </div>
        {row.accountDetails?.accountNumber && (
          <div className="flex justify-between">
            <span className="text-gray-500">Account</span>
            <span className="text-gray-700">****{row.accountDetails.accountNumber.slice(-4)}</span>
          </div>
        )}
        {row.accountDetails?.ifscCode && (
          <div className="flex justify-between">
            <span className="text-gray-500">IFSC</span>
            <span className="text-gray-700">{row.accountDetails.ifscCode}</span>
          </div>
        )}
        {row.accountDetails?.upiId && (
          <div className="flex justify-between">
            <span className="text-gray-500">UPI</span>
            <span className="text-purple-600 font-medium">{row.accountDetails.upiId}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{format(new Date(row.createdAt), 'MMM dd, yyyy · hh:mm a')}</p>
        {row.status === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(row, 'completed')}
              disabled={processMutation.isPending}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle size={12} /> Approve
            </button>
            <button
              onClick={() => handleAction(row, 'rejected')}
              disabled={processMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
            >
              <XCircle size={12} /> Reject
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            {row.processedAt ? `Processed ${format(new Date(row.processedAt), 'MMM dd')}` : '-'}
          </p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vendor Payouts</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and process vendor payout requests</p>
            </div>
            {isFetching && <LoadingSpinner size="sm" />}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Requests', value: stats.total, color: 'from-blue-50 to-blue-100', icon: <FileText className="w-5 h-5 text-blue-600" /> },
              { label: 'Pending', value: stats.pending, color: 'from-yellow-50 to-yellow-100', icon: <Clock className="w-5 h-5 text-yellow-600" /> },
              { label: 'Completed', value: stats.completed, color: 'from-green-50 to-green-100', icon: <CheckCircle className="w-5 h-5 text-green-600" /> },
              { label: 'Total Amount', value: `$${stats.totalAmount.toFixed(2)}`, color: 'from-purple-50 to-purple-100', icon: <DollarSign className="w-5 h-5 text-purple-600" /> },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} p-3 sm:p-4 md:p-5 rounded-xl border border-white/60`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-600">{s.label}</p>
                  {s.icon}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              {['all', 'pending', 'completed', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition ${
                    statusFilter === status ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {data?.payouts && data.payouts.length > 0 ? (
            <>
              {/* Mobile: Cards */}
              <div className="lg:hidden space-y-3">
                {data.payouts.map(row => <PayoutCard key={row._id} row={row} />)}
              </div>

              {/* Desktop: Table */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-gray-500" /> Payout Requests
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Request Date', 'Vendor', 'Amount', 'Method', 'Bank Details', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.payouts.map(row => (
                        <tr key={row._id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 text-sm">{format(new Date(row.createdAt), 'MMM dd, yyyy')}</p>
                            <p className="text-xs text-gray-400">{format(new Date(row.createdAt), 'hh:mm a')}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 text-sm">{row.vendor?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{row.vendor?.email || '-'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-green-600">${Number(row.amount || 0).toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${row.method === 'upi' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {row.method === 'upi' ? 'UPI' : 'Bank Transfer'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs space-y-0.5">
                            <p className="font-medium text-gray-900">{row.accountDetails?.accountHolderName || '-'}</p>
                            <p className="text-gray-500">{row.accountDetails?.bankName || '-'}</p>
                            <p className="text-gray-400">AC: ****{row.accountDetails?.accountNumber?.slice(-4) || 'N/A'}</p>
                            {row.accountDetails?.upiId && <p className="text-purple-600 font-medium">UPI: {row.accountDetails.upiId}</p>}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                          <td className="px-4 py-3">
                            {row.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button onClick={() => handleAction(row, 'completed')} disabled={processMutation.isPending}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50">
                                  ✓ Approve
                                </button>
                                <button onClick={() => handleAction(row, 'rejected')} disabled={processMutation.isPending}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50">
                                  ✗ Reject
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">
                                {row.processedAt ? `${format(new Date(row.processedAt), 'MMM dd, yyyy')}` : '-'}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data?.pages > 1 && (
                <Pagination currentPage={page} totalPages={data.pages} onPageChange={setPage} />
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Banknote className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-600 font-medium">No Payouts Found</p>
              <p className="text-gray-400 text-sm mt-1">{statusFilter === 'all' ? 'No payout requests yet' : `No ${statusFilter} payouts`}</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${actionType === 'completed' ? 'bg-green-100' : 'bg-red-100'}`}>
              {actionType === 'completed'
                ? <CheckCircle className="w-6 h-6 text-green-600" />
                : <XCircle className="w-6 h-6 text-red-600" />
              }
            </div>
            <h3 className="text-xl font-bold text-center mb-2">{actionType === 'completed' ? 'Approve Payout?' : 'Reject Payout?'}</h3>
            <p className="text-gray-500 text-center text-sm mb-5">{actionType === 'completed' ? 'Are you sure you want to approve this payout?' : 'Are you sure you want to reject this payout?'}</p>

            <div className="bg-gray-50 p-4 rounded-xl mb-5 space-y-2 text-sm">
              {[
                { label: 'Vendor', value: selectedPayout.vendor?.name },
                { label: 'Amount', value: `$${selectedPayout.amount}`, bold: true, green: true },
                { label: 'Account', value: `****${selectedPayout.accountDetails?.accountNumber?.slice(-4)}` },
                { label: 'Bank', value: selectedPayout.accountDetails?.bankName },
              ].map(({ label, value, bold, green }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className={`${bold ? 'font-bold' : 'font-medium'} ${green ? 'text-green-600' : 'text-gray-900'}`}>{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowConfirmModal(false); setSelectedPayout(null); }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm"
                disabled={processMutation.isPending}>Cancel</button>
              <button onClick={confirmAction}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white text-sm disabled:opacity-50 ${actionType === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                disabled={processMutation.isPending}>
                {processMutation.isPending ? 'Processing...' : actionType === 'completed' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPayouts;