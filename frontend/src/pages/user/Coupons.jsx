import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function UserCoupons({ onApply }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons/active');
      return res.data.coupons;
    }
  });

  const handleApply = (code) => {
    if (onApply) {
      onApply(code); // checkout ke liye
    }
    toast.success(`Coupon ${code} applied`);
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading coupons...</div>;
  }

  return (
    <div className="container-custom py-8 px-0 md:px-4 space-y-6">
      <h1 className="text-3xl font-bold">Available Coupons</h1>

      {data?.length === 0 && (
        <p className="text-gray-500">No coupons available right now.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {data?.map((coupon) => (
          <div
            key={coupon._id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{coupon.code}</h2>
              <span className="text-sm text-gray-500">
                Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
              </span>
            </div>

            <p className="mt-2 text-gray-700">
              {coupon.type === 'percentage'
                ? `${coupon.value}% OFF`
                : `₹${coupon.value} OFF`}
            </p>

            {coupon.minAmount && (
              <p className="text-sm text-gray-500">
                Min order: ₹{coupon.minAmount}
              </p>
            )}

            <button
              onClick={() => handleApply(coupon.code)}
              className="mt-4 btn-primary w-full"
            >
              Apply Coupon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
