import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { setUser } from '../../features/auth/auth.slice';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .auth-wrapper {
    min-height: 100vh;
    background: #0284c7;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    font-family: 'Poppins', sans-serif;
  }

  .auth-card {
    width: 100%;
    max-width: 880px;
    background: white;
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    min-height: 520px;
    box-shadow: 0 32px 80px rgba(3, 105, 161, 0.35);
  }

  /* LEFT PANEL */
  .auth-left {
    width: 42%;
    background: linear-gradient(145deg, #0284c7 0%, #0369a1 50%, #075985 100%);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 2.5rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .auth-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 20%, rgba(56, 189, 248, 0.25) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 80%, rgba(2, 132, 199, 0.4) 0%, transparent 50%);
  }

  .circle-deco {
    position: absolute;
    border-radius: 50%;
  }

  .circle-1 {
    width: 180px;
    height: 180px;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(2, 132, 199, 0.5));
    border: 1px solid rgba(255,255,255,0.15);
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: inset 0 0 40px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.2);
  }

  .circle-2 {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.4), rgba(3, 105, 161, 0.6));
    border: 1px solid rgba(255,255,255,0.2);
    bottom: 30px;
    right: 20px;
    box-shadow: inset 0 0 20px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.15);
  }

  .circle-3 {
    width: 55px;
    height: 55px;
    background: linear-gradient(135deg, rgba(125, 211, 252, 0.3), rgba(2, 132, 199, 0.4));
    border: 1px solid rgba(255,255,255,0.15);
    top: 50px;
    right: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .left-content {
    position: relative;
    z-index: 2;
  }

  .left-content h2 {
    font-size: 2rem;
    font-weight: 800;
    color: white;
    line-height: 1.1;
    margin: 0 0 0.4rem;
    letter-spacing: -0.5px;
  }

  .left-content h3 {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255,255,255,0.75);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: 0 0 1.2rem;
  }

  .left-content p {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.55);
    line-height: 1.6;
    margin: 0;
    max-width: 220px;
  }

  /* RIGHT PANEL */
  .auth-right {
    flex: 1;
    padding: 2.5rem 2.8rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: white;
  }

  .auth-right h1 {
    font-size: 1.7rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem;
  }

  .auth-right .subtitle {
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0 0 1.6rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.35rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .input-wrap {
    position: relative;
  }

  .input-wrap svg.icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    width: 16px;
    height: 16px;
  }

  .field-input {
    width: 100%;
    padding: 0.65rem 0.9rem 0.65rem 2.5rem;
    font-size: 0.825rem;
    font-family: 'Poppins', sans-serif;
    background: #f3f4f6;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    outline: none;
    color: #111827;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .field-input:focus {
    border-color: #0284c7;
    background: white;
    box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.08);
  }

  .field-input::placeholder { color: #9ca3af; }

  .eye-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    display: flex;
    align-items: center;
    padding: 2px;
    font-size: 0.7rem;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: color 0.2s;
  }

  .eye-btn:hover { color: #0284c7; }

  .row-opts {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.2rem;
    margin-top: 0.25rem;
  }

  .remember-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.73rem;
    color: #4b5563;
    cursor: pointer;
  }

  .remember-label input[type="checkbox"] {
    width: 14px;
    height: 14px;
    accent-color: #0284c7;
    border-radius: 4px;
  }

  .forgot-link {
    font-size: 0.73rem;
    color: #0284c7;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
  }

  .forgot-link:hover { color: #0369a1; }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    background: #0284c7;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
    letter-spacing: 0.2px;
  }

  .btn-primary:hover:not(:disabled) { background: #0369a1; box-shadow: 0 6px 20px rgba(2, 132, 199, 0.4); }
  .btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-outline {
    width: 100%;
    padding: 0.72rem;
    background: white;
    color: #374151;
    font-size: 0.85rem;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .btn-outline:hover { background: #f9fafb; border-color: #d1d5db; }

  .divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 1rem 0;
  }

  .divider-line { flex: 1; height: 1px; background: #e5e7eb; }
  .divider span { font-size: 0.7rem; color: #9ca3af; font-weight: 500; }

  .bottom-link {
    text-align: center;
    margin-top: 0.75rem;
    font-size: 0.73rem;
    color: #6b7280;
  }

  .bottom-link a {
    color: #0284c7;
    font-weight: 600;
    text-decoration: none;
    margin-left: 4px;
  }

  .bottom-link a:hover { text-decoration: underline; }

  .spin {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .google-wrap { margin-bottom: 0; }
  .google-wrap > div { border-radius: 10px !important; overflow: hidden; }

  @media (max-width: 640px) {
    .auth-left { display: none; }
    .auth-right { padding: 2rem 1.5rem; }
    .auth-card { max-width: 420px; }
  }
`;

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
    <>
      <style>{styles}</style>
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Left Panel */}
          <div className="auth-left">
            <div className="circle-deco circle-1" />
            <div className="circle-deco circle-2" />
            <div className="circle-deco circle-3" />
            <div className="left-content">
              <h2>WELCOME</h2>
              <h3>Your Headline Name</h3>
              <p>Sign in to access your account and continue where you left off. Secure, fast and reliable.</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="auth-right">
            <h1>Sign in</h1>
            <p className="subtitle">Enter your credentials to access your account</p>

            {/* Google Login */}
            <div className="google-wrap">
              {googleLoading ? (
                <button className="btn-outline" disabled>
                  <span className="spin" style={{ borderColor: 'rgba(0,0,0,0.15)', borderTopColor: '#0284c7' }} />
                  Signing in with Google...
                </button>
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

            <div className="divider">
              <div className="divider-line" />
              <span>or sign in with email</span>
              <div className="divider-line" />
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="form-group">
                <label>User Name / Email</label>
                <div className="input-wrap">
                  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="field-input"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="field-input"
                    style={{ paddingRight: '3.5rem' }}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="row-opts">
                <label className="remember-label">
                  <input type="checkbox" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? <><span className="spin" /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span>Or</span>
              <div className="divider-line" />
            </div>

            <button className="btn-outline" onClick={() => navigate('/register')}>
              Create Account
            </button>

            <p className="bottom-link">
              Don't have an account?
              <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
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