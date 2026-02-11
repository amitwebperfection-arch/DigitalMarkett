import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../../services/vendor.service';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function VendorBankDetails() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  /* ================= LOAD EXISTING BANK DETAILS ================= */
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const data = await vendorService.getDashboard();

        if (data?.bankDetails) {
          setForm({
            accountHolderName: data.bankDetails.accountHolderName || '',
            bankName: data.bankDetails.bankName || '',
            accountNumber: data.bankDetails.accountNumber || '',
            ifscCode: data.bankDetails.ifscCode || '',
            upiId: data.bankDetails.upiId || ''
          });
        }
      } catch (err) {
        console.error('Failed to load bank details:', err);
        toast.error('Failed to load bank details');
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await vendorService.updateBankDetails(form);
      toast.success('Bank details saved successfully');
      
      // ✅ Invalidate queries to refresh payout page
      queryClient.invalidateQueries({ queryKey: ['vendor-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
    } catch (err) {
      console.error('Failed to save bank details:', err);
      toast.error(
        err?.response?.data?.message || 'Failed to save bank details'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bank Details</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={form.accountHolderName}
                onChange={handleChange}
                placeholder="Enter account holder name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                placeholder="Enter bank name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code *
              </label>
              <input
                type="text"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                placeholder="Enter IFSC code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                name="upiId"
                value={form.upiId}
                onChange={handleChange}
                placeholder="yourname@upi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional - Used for faster payouts if available
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                * Required fields
              </p>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Saving...
                  </span>
                ) : (
                  'Save Bank Details'
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              ℹ️ Important Information
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your bank details are required to process payouts</li>
              <li>• All information is encrypted and stored securely</li>
              <li>• You can update these details anytime</li>
              <li>• Minimum payout amount is $10.00</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorBankDetails;