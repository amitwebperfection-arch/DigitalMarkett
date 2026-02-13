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
import { Plus, Wallet as WalletIcon } from 'lucide-react';

function UserWallet() {
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR'); // default currency
  const queryClient = useQueryClient();

  /* ---------------- Wallet Data ---------------- */
  const { data, isLoading } = useQuery({
    queryKey: ['user-wallet', page],
    queryFn: () => userService.getWalletTransactions({ page, limit: 10 }),
    keepPreviousData: true
  });

  /* ---------------- Verify Payment ---------------- */
  const verifyPaymentMutation = useMutation({
    mutationFn: paymentService.verifyRazorpay,
    onSuccess: () => {
      toast.success('Payment successful, wallet updated');
      setShowAddModal(false);
      setAmount('');
      queryClient.invalidateQueries(['user-wallet']);
    },
    onError: () => {
      toast.error('Payment verification failed');
    }
  });

  /* ---------------- Open Razorpay ---------------- */
  const openPaymentGateway = (order) => {
    const options = {
      key: order.key, // Razorpay public key
      amount: order.amount * 100, // in paise
      currency: order.currency, // INR
      order_id: order.orderId,
      name: 'Wallet Topup',
      description: 'Add funds to wallet',
      handler: function (response) {
        verifyPaymentMutation.mutate({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature
        });
      },
      theme: { color: '#6366f1' }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  /* ---------------- Create Order ---------------- */
  const addFundsMutation = useMutation({
    mutationFn: userService.createWalletOrder,
    onSuccess: (data) => {
      if (data.provider === 'razorpay') {
        openPaymentGateway(data);
      } else {
        // For Stripe, redirect to payment page or handle Stripe checkout here
        toast.success('Stripe payment flow not implemented in this snippet');
      }
    },
    onError: () => {
      toast.error('Unable to create payment order');
    }
  });

  const handleAddFunds = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    addFundsMutation.mutate({
      amount: Number(amount),
      currency
    });
  };

  /* ---------------- Table Columns ---------------- */
  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy HH:mm')
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <span className="capitalize">{row.type}</span>
    },
    {
      key: 'description',
      label: 'Description'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className={row.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
          {row.type === 'credit' ? '+' : '-'}
          {row.currency === 'USD' ? '$' : '₹'}
          {row.amount}
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
    <div className="container-custom py-8 px-0 md:px-4 space-y-6">
      <h1 className="text-3xl font-bold">My Wallet</h1>

      {/* Balance */}
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
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold"
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
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Funds to Wallet"
      >
        <form onSubmit={handleAddFunds} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input w-full"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Currency</label>
            <select
  value={currency}
  onChange={(e) => setCurrency(e.target.value)}
  className="input w-full"
  required
>
  <option value="INR">INR</option>
  <option value="USD">USD</option>
</select>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={addFundsMutation.isPending}
          >
            {addFundsMutation.isPending ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default UserWallet;
