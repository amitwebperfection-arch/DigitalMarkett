import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { ArrowLeft, Zap, Mail, CheckCircle } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 mb-2">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary-900 tracking-tight">
            {sent ? 'Check your inbox' : 'Forgot Password'}
          </h1>
          <p className="text-xs text-primary-400 mt-0.5">
            {sent ? `We sent a reset link to ${email}` : "We'll send you a reset link"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-primary-100 border border-primary-100 p-6">

          {!sent ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-primary-50 border border-primary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all outline-none text-primary-900 placeholder:text-primary-300"
                      required
                    />
                  </div>
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
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-primary-700 font-medium">Reset link sent!</p>
                <p className="text-xs text-primary-400 mt-1">
                  Check your spam folder if you don't see it in a few minutes.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-xs text-primary-500 hover:text-primary-700 font-medium underline transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-primary-100" />
            <span className="text-xs text-primary-300">OR</span>
            <div className="flex-1 h-px bg-primary-100" />
          </div>

          <div className="space-y-2">
            <Link
              to="/login"
              className="flex items-center justify-center w-full py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-all"
            >
              Back to Sign In
            </Link>
            <Link
              to="/"
              className="group flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-primary-400 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;