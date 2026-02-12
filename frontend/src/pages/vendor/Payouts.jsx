import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../../services/vendor.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function VendorPayouts() {
  const [page, setPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const limit = 10;


  /* ================= FETCH PAYOUTS ================= */
  const {
    data,
    isLoading,
    isFetching
  } = useQuery({
    queryKey: ['vendor-payouts', page, limit],
    queryFn: () => vendorService.getPayouts({ page, limit }),
    keepPreviousData: true
  });

  // ====================== SERVICE LAYER======================
  const [withdrawAmount, setWithdrawAmount] = useState(0);

useEffect(() => {
  if (data?.availableBalance && withdrawAmount === 0) {
    setWithdrawAmount(data.availableBalance);
  }
}, [data?.availableBalance]);


  /* ================= REQUEST PAYOUT ================= */
  const requestMutation = useMutation({
    mutationFn: vendorService.requestPayout,
    onSuccess: () => {
      toast.success('Payout request submitted successfully! 🎉');
      queryClient.invalidateQueries({ queryKey: ['vendor-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
      setShowConfirmModal(false);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to request payout'
      );
      setShowConfirmModal(false);
    }
  });

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      key: 'createdAt',
      label: 'Request Date',
      render: (row) =>
        row.createdAt
          ? format(new Date(row.createdAt), 'MMM dd, yyyy')
          : '-'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => `$${Number(row.amount || 0).toFixed(2)}`
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <span className="capitalize">
          {row.method === 'upi' ? 'UPI' : 'Bank Transfer'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : row.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : row.status === 'processing'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'processedAt',
      label: 'Processed Date',
      render: (row) =>
        row.processedAt
          ? format(new Date(row.processedAt), 'MMM dd, yyyy')
          : '-'
    }
  ];

  /* ================= HANDLERS ================= */
  const handleRequestPayout = () => {
    if (!data?.hasBankDetails) {
      toast.error('Please add bank or UPI details before requesting payout');
      return;
    }

    if (!data?.availableBalance || data.availableBalance < 10) {
      toast.error('Minimum payout amount is $10');
      return;
    }

    setShowConfirmModal(true);
  };

const confirmPayout = () => {
  if (withdrawAmount < 10) {
    toast.error('Minimum payout amount is $10');
    return;
  }

  if (withdrawAmount > data.availableBalance) {
    toast.error('Amount exceeds available balance');
    return;
  }

  requestMutation.mutate({
    amount: withdrawAmount,
    method: bankDetails?.upiId ? 'upi' : 'bank',
    accountDetails: bankDetails
  });
};


  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const bankDetails = data?.bankDetails;

  /* ================= UI ================= */
  return (
    <>
      <div className="container-custom py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Payouts</h1>
          <button
            onClick={() => navigate('/vendor/profile')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit Bank Details →
          </button>
        </div>

        {/* ===== Balance & Bank Details Card ===== */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Balance */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow border border-green-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">
                  Available Balance
                </p>
                <p className="text-4xl font-bold text-green-800">
                  ${Number(data?.availableBalance || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <button
              onClick={handleRequestPayout}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                requestMutation.isPending ||
                !data?.hasBankDetails ||
                !data?.availableBalance ||
                data.availableBalance < 10
              }
            >
              {requestMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Processing...
                </span>
              ) : (
                'Request Payout'
              )}
            </button>

            {!data?.hasBankDetails && (
              <p className="text-sm text-red-600 mt-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Please add your bank details first
              </p>
            )}

            {data?.availableBalance < 10 && data?.hasBankDetails && (
              <p className="text-sm text-gray-600 mt-3">
                Minimum payout amount is $10.00
              </p>
            )}
          </div>

          {/* Bank Details */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Bank Details</h3>
              {data?.hasBankDetails && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Verified
                </span>
              )}
            </div>

            {data?.hasBankDetails && bankDetails ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Account Holder</p>
                  <p className="font-medium text-gray-800">{bankDetails.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bank Name</p>
                  <p className="font-medium text-gray-800">{bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="font-medium text-gray-800">
                    ****{bankDetails.accountNumber?.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">IFSC Code</p>
                  <p className="font-medium text-gray-800">{bankDetails.ifscCode}</p>
                </div>
                {bankDetails.upiId && (
                  <div>
                    <p className="text-xs text-gray-500">UPI ID</p>
                    <p className="font-medium text-gray-800">{bankDetails.upiId}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-3">No bank details added</p>
                <button
                  onClick={() => navigate('/vendor/profile')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Add Bank Details →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== Payout History ===== */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Payout History
          </h2>

          {data?.payouts && data.payouts.length > 0 ? (
            <>
              <Table
                columns={columns}
                data={data.payouts}
                isLoading={isFetching}
              />

              {data?.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={page}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payout History</h3>
              <p className="text-gray-600">Your payout requests will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== CUSTOM CONFIRMATION MODAL ===== */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-center mb-2">Confirm Payout Request</h3>
            <div className="mb-4 text-center">
              <p className="text-gray-600 mb-2">
                Enter the amount you want to withdraw:
              </p>
              <input
                type="number"
                min={10}
                max={data?.availableBalance || 0}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-2/3 border border-gray-300 rounded-lg px-3 py-2 text-center"
                placeholder={`Min $10, Max $${data?.availableBalance?.toFixed(2)}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum available balance: ${data?.availableBalance?.toFixed(2)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-xs text-gray-500 mb-2">Payout Details:</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Account:</span> <span className="font-medium">****{bankDetails?.accountNumber?.slice(-4)}</span></p>
                <p><span className="text-gray-600">Bank:</span> <span className="font-medium">{bankDetails?.bankName}</span></p>
                <p><span className="text-gray-600">Method:</span> <span className="font-medium">{bankDetails?.upiId ? 'UPI' : 'Bank Transfer'}</span></p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                disabled={requestMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmPayout}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                disabled={requestMutation.isPending}
              >
                {requestMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Processing...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VendorPayouts;