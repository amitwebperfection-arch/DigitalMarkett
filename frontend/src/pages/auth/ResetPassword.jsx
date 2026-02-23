import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { ArrowLeft, Zap, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      setDone(true);
      toast.success('Password reset successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 text-sm bg-primary-50 border border-primary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all outline-none text-primary-900 placeholder:text-primary-300";

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 mb-2">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary-900 tracking-tight">
            {done ? 'Password Reset!' : 'Set New Password'}
          </h1>
          <p className="text-xs text-primary-400 mt-0.5">
            {done ? 'You can now sign in with your new password' : 'Choose a strong new password'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-primary-100 border border-primary-100 p-6">

          {!done ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password"
                    className={`${inputCls} pl-9 pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className={`${inputCls} pl-9`}
                    required
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-primary-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Resetting...
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-primary-700 font-medium">All done!</p>
                <p className="text-xs text-primary-400 mt-1">Your password has been updated successfully.</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-primary-200 active:scale-[0.98]"
              >
                Go to Sign In
              </button>
            </div>
          )}

          {!done && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-primary-100" />
                <span className="text-xs text-primary-300">OR</span>
                <div className="flex-1 h-px bg-primary-100" />
              </div>
              <Link
                to="/login"
                className="group flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-primary-400 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;