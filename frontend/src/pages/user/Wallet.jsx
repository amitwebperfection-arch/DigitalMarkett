import { useState, useMemo } from 'react';
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
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';

// ─── Fetch public payment config from backend ─────────────────
const fetchPaymentConfig = async () => {
  const { data } = await api.get('/payments/config');
  return data; // { stripe: { enabled, publicKey }, razorpay: { enabled, keyId }, wallet, cod }
};

// ─── Stripe Card Form (inner component needs Elements context) ─
function StripeCardForm({ amount, onSuccess, onCancel }) {
  const stripe    = useStripe();
  const elements  = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      // 1. Create topup intent on backend
      const { data } = await api.post('/wallet/topup/init', {
        amount:   Number(amount),
        currency: 'usd',
        provider: 'stripe',
      });

      // 2. Confirm card payment with clientSecret
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful! Wallet updated.');
        onSuccess();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#374151',
                '::placeholder': { color: '#9ca3af' },
              },
            },
          }}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={processing || !stripe}
          className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay $${Number(amount).toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────
function UserWallet() {
  const [page, setPage]                   = useState(1);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [amount, setAmount]               = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [step, setStep]                   = useState('select'); // 'select' | 'stripe-card'
  const queryClient = useQueryClient();

  // ── Wallet transactions ──────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['user-wallet', page],
    queryFn:  () => userService.getWalletTransactions({ page, limit: 10 }),
    keepPreviousData: true,
  });

  // ── Payment config (DB → public keys only) ───────────────────
  const { data: payConfig, isLoading: configLoading } = useQuery({
    queryKey: ['payment-config'],
    queryFn:  fetchPaymentConfig,
    onSuccess: (cfg) => {
      // Auto-select first enabled provider
      if (!selectedProvider) {
        if (cfg?.razorpay?.enabled)      setSelectedProvider('razorpay');
        else if (cfg?.stripe?.enabled)   setSelectedProvider('stripe');
      }
    },
  });

  // ── Stripe promise — built from DB publicKey ─────────────────
  // useMemo so we don't re-create on every render
  const stripePromise = useMemo(() => {
    const key = payConfig?.stripe?.publicKey;
    if (payConfig?.stripe?.enabled && key) {
      return loadStripe(key);
    }
    return null;
  }, [payConfig?.stripe?.enabled, payConfig?.stripe?.publicKey]);

  // ── Verify Razorpay payment ───────────────────────────────────
  const verifyRazorpayMutation = useMutation({
    mutationFn: paymentService.verifyRazorpay,
    onSuccess: () => {
      toast.success('Payment successful! Wallet updated.');
      closeModal();
      queryClient.invalidateQueries(['user-wallet']);
    },
    onError: () => toast.error('Payment verification failed'),
  });

  // ── Open Razorpay checkout ────────────────────────────────────
  const openRazorpay = (resData) => {
    if (!window.Razorpay) {
      toast.error('Razorpay not loaded. Please refresh the page.');
      return;
    }
    new window.Razorpay({
      key:      resData.key,            // from backend (DB keyId)
      amount:   resData.amount * 100,   // backend returns rupees, Razorpay needs paise
      currency: resData.currency || 'INR',
      order_id: resData.orderId,
      name:     'Digital Marketplace',
      description: 'Wallet Topup',
      handler: (response) => {
        verifyRazorpayMutation.mutate({
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature:  response.razorpay_signature,
        });
      },
      theme: { color: '#6366f1' },
    }).open();
  };

  // ── Init topup (Razorpay order / Stripe intent) ───────────────
  const addFundsMutation = useMutation({
    mutationFn: (payload) =>
      api.post('/wallet/topup/init', payload).then((r) => r.data),
    onSuccess: (resData) => {
      if (resData.provider === 'razorpay') {
        openRazorpay(resData);
      } else if (resData.provider === 'stripe') {
        setStep('stripe-card');
      }
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || 'Unable to create payment order'),
  });

  const handleProceed = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount');
    if (!selectedProvider)              return toast.error('Select a payment method');

    if (selectedProvider === 'razorpay') {
      addFundsMutation.mutate({
        amount:   Number(amount),
        currency: 'INR',
        provider: 'razorpay',
      });
    } else if (selectedProvider === 'stripe') {
      // Don't call backend yet — go to card step first
      setStep('stripe-card');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setStep('select');
    setAmount('');
  };

  const onStripeSuccess = () => {
    closeModal();
    queryClient.invalidateQueries(['user-wallet']);
  };

  // ── Table columns ─────────────────────────────────────────────
  const columns = [
    {
      key:    'createdAt',
      label:  'Date',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy HH:mm'),
    },
    {
      key:    'type',
      label:  'Type',
      render: (row) => (
        <span
          className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium
            ${row.type === 'credit'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'}`}
        >
          {row.type}
        </span>
      ),
    },
    { key: 'description', label: 'Description' },
    {
      key:    'amount',
      label:  'Amount',
      render: (row) => (
        <span className={`font-semibold ${row.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
          {row.type === 'credit' ? '+' : '-'}
          {row.currency === 'USD' ? '$' : '₹'}
          {row.amount}
        </span>
      ),
    },
  ];

  if (isLoading) return (
    <div className="flex justify-center items-center h-96">
      <LoadingSpinner size="lg" />
    </div>
  );

  const enabledProviders = [];
  if (payConfig?.razorpay?.enabled) enabledProviders.push('razorpay');
  if (payConfig?.stripe?.enabled)   enabledProviders.push('stripe');

  const currencySymbol  = selectedProvider === 'stripe' ? '$' : '₹';
  const quickAmounts    = selectedProvider === 'stripe'
    ? [5, 10, 25, 50]
    : [100, 250, 500, 1000];

  return (
    <div className="container-custom py-8 px-0 md:px-4 space-y-6">
      <h1 className="text-3xl font-bold">My Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <WalletIcon className="w-6 h-6" />
              <span className="text-sm opacity-90">Current Balance</span>
            </div>
            <div className="text-4xl font-bold">
              ₹{data?.balance?.toFixed(2) || '0.00'}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition shadow"
          >
            <Plus className="inline w-5 h-5 mr-1" />
            Add Funds
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {(data?.transactions?.length ?? 0) === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <>
            <Table columns={columns} data={data?.transactions || []} />
            {data?.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* ── Add Funds Modal ── */}
      <Modal isOpen={showAddModal} onClose={closeModal} title="Add Funds to Wallet">

        {/* STEP 1 — Provider + Amount */}
        {step === 'select' && (
          <form onSubmit={handleProceed} className="space-y-5">

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>

              {configLoading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-3">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Loading payment options...
                </div>
              ) : enabledProviders.length === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                  No payment methods enabled. Please contact admin.
                </div>
              ) : (
                <div className="space-y-3">

                  {/* Razorpay */}
                  {payConfig?.razorpay?.enabled && (
                    <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition
                      ${selectedProvider === 'razorpay'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio" name="provider" value="razorpay"
                        checked={selectedProvider === 'razorpay'}
                        onChange={() => { setSelectedProvider('razorpay'); setAmount(''); }}
                        className="accent-primary-600"
                      />
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Razorpay</p>
                        <p className="text-xs text-gray-500">UPI · Cards · Net Banking · Wallets</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600">₹ INR</span>
                    </label>
                  )}

                  {/* Stripe */}
                  {payConfig?.stripe?.enabled && (
                    <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition
                      ${selectedProvider === 'stripe'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio" name="provider" value="stripe"
                        checked={selectedProvider === 'stripe'}
                        onChange={() => { setSelectedProvider('stripe'); setAmount(''); }}
                        className="accent-purple-600"
                      />
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Stripe</p>
                        <p className="text-xs text-gray-500">Credit · Debit Card</p>
                      </div>
                      <span className="text-xs font-bold text-purple-600">$ USD</span>
                    </label>
                  )}

                </div>
              )}
            </div>

            {/* Amount */}
            {selectedProvider && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ({currencySymbol})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input w-full pl-8"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Quick select amounts */}
                <div className="flex gap-2 flex-wrap">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition
                        ${Number(amount) === q
                          ? selectedProvider === 'stripe'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {currencySymbol}{q}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Summary */}
            {amount && selectedProvider && Number(amount) > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between text-sm">
                <span className="text-gray-500">You will add</span>
                <span className="font-semibold text-gray-900">
                  {currencySymbol}{Number(amount).toFixed(2)} via{' '}
                  {selectedProvider === 'razorpay' ? 'Razorpay' : 'Stripe'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={
                addFundsMutation.isPending ||
                !selectedProvider ||
                !amount ||
                Number(amount) <= 0 ||
                enabledProviders.length === 0
              }
              className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold
                hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addFundsMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : 'Continue →'}
            </button>
          </form>
        )}

        {/* STEP 2 — Stripe Card */}
        {step === 'stripe-card' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-sm text-purple-700 flex justify-between">
              <span>Paying via Stripe</span>
              <span className="font-bold">${Number(amount).toFixed(2)}</span>
            </div>

            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <StripeCardForm
                  amount={amount}
                  onSuccess={onStripeSuccess}
                  onCancel={() => setStep('select')}
                />
              </Elements>
            ) : (
              <div className="text-center py-8 space-y-2">
                <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-gray-500 text-sm">
                  Stripe is not configured. Please contact admin to add the Stripe Publishable Key in{' '}
                  <span className="font-medium">Settings → Payment → Stripe</span>.
                </p>
                <button
                  onClick={() => setStep('select')}
                  className="text-primary-600 text-sm hover:underline mt-2"
                >
                  ← Go back
                </button>
              </div>
            )}
          </div>
        )}

      </Modal>
    </div>
  );
}

export default UserWallet;