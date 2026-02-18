import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { paymentService } from '../../services/payment.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Wallet as WalletIcon, CreditCard, Smartphone } from 'lucide-react';
import api from '../../services/api';

// ─── Fetch public payment config from backend ──────────────────
const fetchPaymentConfig = async () => {
  const { data } = await api.get('/payments/config');
  return data;
};

function UserWallet() {
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const queryClient = useQueryClient();

  // ─── Wallet Data ───────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['user-wallet', page],
    queryFn: () => userService.getWalletTransactions({ page, limit: 10 }),
    keepPreviousData: true
  });

  // ─── Payment Config ────────────────────────────────────────
  const { data: payConfig, isLoading: configLoading } = useQuery({
    queryKey: ['payment-config'],
    queryFn: fetchPaymentConfig,
    onSuccess: (cfg) => {
      // Auto-select first enabled provider
      if (cfg?.razorpay?.enabled) setSelectedProvider('razorpay');
      else if (cfg?.stripe?.enabled) setSelectedProvider('stripe');
    }
  });

  // ─── Verify Razorpay ───────────────────────────────────────
  const verifyPaymentMutation = useMutation({
    mutationFn: paymentService.verifyRazorpay,
    onSuccess: () => {
      toast.success('Payment successful! Wallet updated.');
      setShowAddModal(false);
      setAmount('');
      queryClient.invalidateQueries(['user-wallet']);
    },
    onError: () => toast.error('Payment verification failed')
  });

  // ─── Open Razorpay ─────────────────────────────────────────
  const openRazorpay = (data) => {
    if (!window.Razorpay) {
      toast.error('Razorpay not loaded. Refresh and try again.');
      return;
    }
    const options = {
      key: data.key,
      amount: data.amount * 100,
      currency: data.currency || 'INR',
      order_id: data.orderId,
      name: 'Digital Marketplace',
      description: 'Wallet Topup',
      handler: (response) => {
        verifyPaymentMutation.mutate({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      theme: { color: '#6366f1' }
    };
    new window.Razorpay(options).open();
  };

  // ─── Create Order / Init Topup ─────────────────────────────
  const addFundsMutation = useMutation({
    mutationFn: userService.createWalletOrder,
    onSuccess: (data) => {
      if (data.provider === 'razorpay') {
        openRazorpay(data);
      } else if (data.provider === 'stripe') {
        toast.info('Stripe wallet topup coming soon.');
      }
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Unable to create payment order');
    }
  });

  const handleAddFunds = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!selectedProvider) {
      toast.error('Please select a payment method');
      return;
    }
    const currency = selectedProvider === 'razorpay' ? 'INR' : 'USD';
    addFundsMutation.mutate({ amount: Number(amount), currency, provider: selectedProvider });
  };

  // ─── Table Columns ─────────────────────────────────────────
  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy HH:mm')
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium
          ${row.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.type}
        </span>
      )
    },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className={`font-semibold ${row.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
          {row.type === 'credit' ? '+' : '-'}
          {row.currency === 'USD' ? '$' : '₹'}
          {row.amount}
        </span>
      )
    }
  ];

  if (isLoading) return (
    <div className="flex justify-center items-center h-96">
      <LoadingSpinner size="lg" />
    </div>
  );

  const enabledProviders = [];
  if (payConfig?.razorpay?.enabled) enabledProviders.push('razorpay');
  if (payConfig?.stripe?.enabled) enabledProviders.push('stripe');

  return (
    <div className="container-custom py-8 px-0 md:px-4 space-y-6">
      <h1 className="text-3xl font-bold">My Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <WalletIcon className="w-6 h-6" />
              <span className="text-sm opacity-90">Current Balance</span>
            </div>
            <div className="text-4xl font-bold">
              {data?.currency === 'USD' ? '$' : '₹'}
              {data?.balance?.toFixed(2) || '0.00'}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <Plus className="inline w-5 h-5 mr-2" />
            Add Funds
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <Table columns={columns} data={data?.transactions || []} />
        {data?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Add Funds Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Funds to Wallet">
        <form onSubmit={handleAddFunds} className="space-y-5">

          {/* Amount */}
          <div>
            <label className="block font-medium mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input w-full"
              placeholder="Enter amount"
              min="1"
              required
            />
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block font-medium mb-2">Payment Method</label>

            {configLoading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Loading payment options...
              </div>
            ) : enabledProviders.length === 0 ? (
              <p className="text-red-500 text-sm">No payment methods enabled. Contact admin.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">

                {/* Razorpay Option */}
                {payConfig?.razorpay?.enabled && (
                  <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition
                    ${selectedProvider === 'razorpay'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="provider"
                      value="razorpay"
                      checked={selectedProvider === 'razorpay'}
                      onChange={() => setSelectedProvider('razorpay')}
                      className="accent-primary-600"
                    />
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-sm">Razorpay</p>
                        <p className="text-xs text-gray-500">UPI, Cards, Net Banking (INR)</p>
                      </div>
                    </div>
                  </label>
                )}

                {/* Stripe Option */}
                {payConfig?.stripe?.enabled && (
                  <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition
                    ${selectedProvider === 'stripe'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="provider"
                      value="stripe"
                      checked={selectedProvider === 'stripe'}
                      onChange={() => setSelectedProvider('stripe')}
                      className="accent-primary-600"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-semibold text-sm">Stripe</p>
                        <p className="text-xs text-gray-500">Credit / Debit Card (USD)</p>
                      </div>
                    </div>
                  </label>
                )}

              </div>
            )}
          </div>

          {/* Amount preview */}
          {amount && selectedProvider && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              You will add{' '}
              <span className="font-semibold text-gray-900">
                {selectedProvider === 'razorpay' ? '₹' : '$'}{amount}
              </span>{' '}
              via <span className="capitalize font-medium">{selectedProvider}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={addFundsMutation.isPending || !selectedProvider || enabledProviders.length === 0}
          >
            {addFundsMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : 'Pay Now'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default UserWallet;