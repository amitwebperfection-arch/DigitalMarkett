import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/auth.service';
import { vendorService } from '../../services/vendor.service';
import { updateUser } from '../../features/auth/auth.slice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function VendorProfile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    description: ''
  });

  const [bankData, setBankData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          businessName: user?.vendorInfo?.businessName || '',
          description: user?.vendorInfo?.description || ''
        });

        try {
          const data = await vendorService.getDashboard();
          if (data?.bankDetails) {
            setBankData({
              accountHolderName: data.bankDetails.accountHolderName || '',
              bankName: data.bankDetails.bankName || '',
              accountNumber: data.bankDetails.accountNumber || '',
              ifscCode: data.bankDetails.ifscCode || '',
              upiId: data.bankDetails.upiId || ''
            });
          }
        } catch (err) {
          console.error('Failed to load bank details:', err);
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      dispatch(updateUser(data.user));
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  });

  const updateBankMutation = useMutation({
    mutationFn: vendorService.updateBankDetails,
    onSuccess: () => {
      toast.success('Bank details updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendor-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save bank details');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Password change failed');
    }
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBankChange = (e) => {
    setBankData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();
    updateBankMutation.mutate(bankData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="container-custom py-8 px-0 md:px-4">
      <h1 className="text-3xl font-bold mb-6">Vendor Profile</h1>

      {user?.vendorInfo?.status && (
        <div className={`mb-6 p-4 rounded-lg ${getStatusBadge(user.vendorInfo.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Vendor Status: {user.vendorInfo.status.toUpperCase()}</p>
              {user.vendorInfo.status === 'pending' && (
                <p className="text-sm mt-1">Your vendor application is under review</p>
              )}
              {user.vendorInfo.status === 'approved' && (
                <p className="text-sm mt-1">
                  Approved on {new Date(user.vendorInfo.approvedAt).toLocaleDateString()}
                </p>
              )}
              {user.vendorInfo.status === 'rejected' && (
                <p className="text-sm mt-1">Your application was not approved. Please contact support.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'business'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Business Details
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'bank'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bank Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Security
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                className="btn-primary px-6 py-2 disabled:opacity-50"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Updating...
                  </span>
                ) : (
                  'Update Personal Info'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'business' && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Business Details</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={user?.vendorInfo?.status === 'approved'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe your business, products, and services..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={user?.vendorInfo?.status === 'approved'}
                />
              </div>

              {user?.vendorInfo?.appliedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Date
                  </label>
                  <input
                    type="text"
                    value={new Date(user.vendorInfo.appliedAt).toLocaleDateString()}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn-primary px-6 py-2 disabled:opacity-50"
                disabled={updateProfileMutation.isPending || user?.vendorInfo?.status === 'approved'}
              >
                {updateProfileMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Updating...
                  </span>
                ) : (
                  'Update Business Details'
                )}
              </button>
              
              {user?.vendorInfo?.status === 'approved' && (
                <p className="text-sm text-gray-500 mt-2">
                  Business details cannot be changed after approval. Contact support for changes.
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {activeTab === 'bank' && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-6">
              Add your bank details to receive payments for your sales.
            </p>
            <form onSubmit={handleBankSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={bankData.accountHolderName}
                  onChange={handleBankChange}
                  placeholder="Enter account holder name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={bankData.bankName}
                    onChange={handleBankChange}
                    placeholder="e.g., State Bank of India"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankData.accountNumber}
                    onChange={handleBankChange}
                    placeholder="Enter account number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={bankData.ifscCode}
                    onChange={handleBankChange}
                    placeholder="e.g., SBIN0001234"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    value={bankData.upiId}
                    onChange={handleBankChange}
                    placeholder="e.g., yourname@paytm"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional - Used for faster payouts if available
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-blue-900">ℹ️ Important Information</p>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Your bank details are required to process payouts</li>
                      <li>• All information is encrypted and stored securely</li>
                      <li>• You can update these details anytime</li>
                      <li>• Minimum payout amount is $10.00</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">* Required fields</p>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2 disabled:opacity-50"
                  disabled={updateBankMutation.isPending}
                >
                  {updateBankMutation.isPending ? (
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
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary px-6 py-2 disabled:opacity-50"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Changing...
                  </span>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorProfile;