import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { setUser } from '../../features/auth/auth.slice';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Store, ArrowLeft, Mail, Zap, CheckCircle } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const inputCls = "w-full px-3 py-2 text-sm bg-primary-50 border border-primary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all outline-none text-primary-900 placeholder:text-primary-300";
const labelCls = "block text-xs font-semibold text-primary-700 mb-1";

function RegisterInner() {
  const [accountType, setAccountType] = useState('user');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    businessName: '', description: ''
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (accountType === 'vendor') {
      if (!formData.businessName || formData.businessName.trim().length < 3) { toast.error('Business name must be at least 3 characters'); return; }
      if (!formData.description || formData.description.trim().length < 10) { toast.error('Description must be at least 10 characters'); return; }
    }
    setIsLoading(true);
    try {
      await authService.register({
        name: formData.name, email: formData.email, password: formData.password, accountType,
        businessName: accountType === 'vendor' ? formData.businessName : undefined,
        description: accountType === 'vendor' ? formData.description : undefined
      });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { toast.error('Please enter a valid 6-digit OTP'); return; }
    setIsLoading(true);
    try {
      const data = await authService.verifyOTP(formData.email, otp);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch(setUser({ user: data.user, token: data.token }));
      if (accountType === 'vendor') {
        toast.success('Registration successful! Pending approval.');
        navigate('/vendor/pending-approval');
      } else {
        toast.success('Registration successful!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally { setIsLoading(false); }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try { await authService.resendOTP(formData.email); toast.success('OTP resent!'); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed to resend OTP'); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const data = await authService.googleAuth(credentialResponse.credential);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch(setUser({ user: data.user, token: data.token }));
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google sign up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 mb-2">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-primary-900 tracking-tight">
          {step === 1 ? 'Create Account' : 'Verify Email'}
        </h1>
        <p className="text-xs text-primary-400 mt-0.5">
          {step === 1 ? 'Join us today' : `Code sent to ${formData.email}`}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-primary-100 border border-primary-100 p-5">
        {step === 1 ? (
          <>
            {/* Account Type Toggle */}
            <div className="flex gap-1.5 p-1 bg-primary-50 rounded-lg mb-4 border border-primary-100">
              <button type="button" onClick={() => setAccountType('user')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                  accountType === 'user' ? 'bg-primary-600 text-white shadow-sm' : 'text-primary-500 hover:text-primary-700'
                }`}>
                <User className="w-3.5 h-3.5" /> User
              </button>
              <button type="button" onClick={() => setAccountType('vendor')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                  accountType === 'vendor' ? 'bg-primary-600 text-white shadow-sm' : 'text-primary-500 hover:text-primary-700'
                }`}>
                <Store className="w-3.5 h-3.5" /> Vendor
              </button>
            </div>

            {accountType === 'user' && (
              <>
                <div className="mb-3">
                  {googleLoading ? (
                    <div className="w-full py-2.5 flex items-center justify-center gap-2 border border-primary-200 rounded-lg text-sm text-primary-500 bg-primary-50">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account...
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google sign up failed. Please try again.')}
                      useOneTap={false}
                      theme="outline"
                      size="large"
                      width="100%"
                      text="signup_with"
                      shape="rectangular"
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-primary-100" />
                  <span className="text-xs text-primary-300">or register with email</span>
                  <div className="flex-1 h-px bg-primary-100" />
                </div>
              </>
            )}

            {/* Vendor note */}
            {accountType === 'vendor' && (
              <div className="mb-3 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-xs text-primary-600">
                  🏪 Vendor accounts require email verification and admin approval.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={inputCls} required />
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputCls} required />
              </div>

              {accountType === 'vendor' && (
                <div className="space-y-3 p-3 bg-primary-50 rounded-xl border border-primary-200">
                  <div>
                    <label className={labelCls}>Business Name</label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Your Business" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Business Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tell us about your business..." className={`${inputCls} resize-none`} rows="2" required />
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create password" className={`${inputCls} pr-10`} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" className={inputCls} required />
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-1">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : 'Continue'}
              </button>
            </form>
          </>
        ) : (
          /* OTP Step */
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-700 mb-1 text-center">Verification Code</label>
              <input
                type="text" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] bg-primary-50 border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-primary-900"
                maxLength="6" required
              />
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Verify & Complete</>
              )}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={handleResendOTP} disabled={isLoading} className="text-primary-500 hover:text-primary-700 font-medium transition-colors">
                Resend Code
              </button>
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-primary-400 hover:text-primary-600 font-medium transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-primary-100" />
          <span className="text-xs text-primary-300">OR</span>
          <div className="flex-1 h-px bg-primary-100" />
        </div>

        <div className="space-y-2">
          <Link to="/login" className="flex items-center justify-center w-full py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-all">
            Sign In
          </Link>
          <Link to="/" className="group flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-primary-400 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}

function Register() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RegisterInner />
    </GoogleOAuthProvider>
  );
}

export default Register;