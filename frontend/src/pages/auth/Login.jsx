// Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { setUser } from '../../features/auth/auth.slice';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, Zap } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function LoginInner() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRedirect = (user) => {
    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'vendor') navigate('/vendor');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authService.login(formData.email, formData.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch(setUser({ user: data.user, token: data.token }));
      toast.success('Login successful!');
      handleRedirect(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const data = await authService.googleAuth(credentialResponse.credential);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch(setUser({ user: data.user, token: data.token }));
      toast.success('Login successful!');
      handleRedirect(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 mb-2">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-primary-900 tracking-tight">Welcome back</h1>
        <p className="text-xs text-primary-400 mt-0.5">Sign in to your account</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-primary-100 border border-primary-100 p-6">
        {/* Google Button */}
        <div className="mb-4">
          {googleLoading ? (
            <div className="w-full py-2.5 flex items-center justify-center gap-2 border border-primary-200 rounded-lg text-sm text-primary-500 bg-primary-50">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in with Google...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed. Please try again.')}
              useOneTap={false}
              theme="outline"
              size="large"
              width="100%"
              text="signin_with"
              shape="rectangular"
            />
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-primary-100" />
          <span className="text-xs text-primary-300">or sign in with email</span>
          <div className="flex-1 h-px bg-primary-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-primary-700 mb-1">Email</label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 text-sm bg-primary-50 border border-primary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all outline-none text-primary-900 placeholder:text-primary-300"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-primary-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-500 hover:text-primary-700 font-medium transition-colors">Forgot?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-3 py-2.5 pr-10 text-sm bg-primary-50 border border-primary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all outline-none text-primary-900 placeholder:text-primary-300"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border-primary-300 text-primary-600 focus:ring-primary-200" />
            <span className="text-xs text-primary-600">Remember me</span>
          </label>

          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-primary-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-primary-100" />
          <span className="text-xs text-primary-300">OR</span>
          <div className="flex-1 h-px bg-primary-100" />
        </div>

        <div className="space-y-2">
          <Link to="/register" className="flex items-center justify-center w-full py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-all">
            Create Account
          </Link>
          <Link to="/" className="group flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-primary-400 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function Login() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginInner />
    </GoogleOAuthProvider>
  );
}

export default Login;