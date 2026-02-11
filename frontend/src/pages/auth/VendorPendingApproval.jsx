import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Clock, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../../services/auth.service';
import { setUser } from '../../features/auth/auth.slice';
import toast from 'react-hot-toast';

function VendorPendingApproval() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await authService.getProfile();
      
      // Update Redux and localStorage
      dispatch(setUser({ user: data.user, token }));
      localStorage.setItem('user', JSON.stringify(data.user));

      // ✅ If approved, redirect to vendor dashboard
      if (data.user.role === 'vendor' && data.user.vendorInfo?.status === 'approved') {
        toast.success('Your application has been approved!');
        navigate('/vendor/dashboard');
      } else {
        toast.info('Status updated');
      }
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
        <div className="mb-6">
          <Clock className="w-16 h-16 mx-auto text-yellow-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Application Pending
        </h1>

        <p className="text-gray-600 mb-6">
          Your vendor application has been submitted successfully and is currently under review.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 text-left">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Check Your Email
              </p>
              <p className="text-sm text-blue-700">
                We'll notify you at <strong>{user?.email}</strong> once your application is reviewed.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Business information verified</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Email verified</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span>Admin approval pending</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>What happens next?</strong>
          </p>
          <ul className="text-sm text-gray-600 text-left space-y-1 ml-5 list-disc">
            <li>Our team will review your application</li>
            <li>This typically takes 1-2 business days</li>
            <li>You'll receive an email notification</li>
            <li>Once approved, you can start selling</li>
          </ul>
        </div>

        {/* ✅ ADD REFRESH BUTTON */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition font-medium mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Checking...' : 'Check Approval Status'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-600 text-white py-2.5 px-4 rounded-lg hover:bg-gray-700 transition font-medium"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default VendorPendingApproval;