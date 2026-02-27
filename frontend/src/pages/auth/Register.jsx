import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { setUser } from '../../features/auth/auth.slice';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Store, ArrowLeft, CheckCircle } from 'lucide-react';

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
    max-width: 900px;
    background: white;
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    min-height: 540px;
    box-shadow: 0 32px 80px rgba(3, 105, 161, 0.35);
  }

  .auth-left {
    width: 38%;
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
    width: 170px;
    height: 170px;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(2, 132, 199, 0.5));
    border: 1px solid rgba(255,255,255,0.15);
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: inset 0 0 40px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.2);
  }

  .circle-2 {
    width: 75px;
    height: 75px;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.4), rgba(3, 105, 161, 0.6));
    border: 1px solid rgba(255,255,255,0.2);
    bottom: 30px;
    right: 20px;
    box-shadow: inset 0 0 20px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.15);
  }

  .circle-3 {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, rgba(125, 211, 252, 0.3), rgba(2, 132, 199, 0.4));
    border: 1px solid rgba(255,255,255,0.15);
    top: 50px;
    right: 30px;
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
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255,255,255,0.75);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: 0 0 1.2rem;
  }

  .left-content p {
    font-size: 0.73rem;
    color: rgba(255,255,255,0.55);
    line-height: 1.6;
    margin: 0;
    max-width: 200px;
  }

  .auth-right {
    flex: 1;
    padding: 2rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: white;
    overflow-y: auto;
  }

  .auth-right h1 {
    font-size: 1.6rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.2rem;
  }

  .auth-right .subtitle {
    font-size: 0.73rem;
    color: #9ca3af;
    margin: 0 0 1.2rem;
  }

  /* Account type toggle */
  .type-toggle {
    display: flex;
    gap: 6px;
    padding: 4px;
    background: #f3f4f6;
    border-radius: 10px;
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
  }

  .type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0.5rem;
    border-radius: 7px;
    font-size: 0.78rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    color: #6b7280;
    background: transparent;
  }

  .type-btn.active {
    background: #0284c7;
    color: white;
    box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
  }

  .type-btn svg { width: 14px; height: 14px; }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-group label {
    display: block;
    font-size: 0.68rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .input-wrap { position: relative; }

  .input-wrap svg.icon {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    width: 15px;
    height: 15px;
  }

  .field-input {
    width: 100%;
    padding: 0.6rem 0.85rem 0.6rem 2.2rem;
    font-size: 0.8rem;
    font-family: 'Poppins', sans-serif;
    background: #f3f4f6;
    border: 1.5px solid #e5e7eb;
    border-radius: 9px;
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

  .field-input.no-icon {
    padding-left: 0.85rem;
  }

  .field-textarea {
    width: 100%;
    padding: 0.6rem 0.85rem;
    font-size: 0.8rem;
    font-family: 'Poppins', sans-serif;
    background: #f3f4f6;
    border: 1.5px solid #e5e7eb;
    border-radius: 9px;
    outline: none;
    color: #111827;
    transition: all 0.2s;
    box-sizing: border-box;
    resize: none;
  }

  .field-textarea:focus {
    border-color: #0284c7;
    background: white;
    box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.08);
  }

  .field-textarea::placeholder { color: #9ca3af; }

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
    transition: color 0.2s;
  }

  .eye-btn:hover { color: #0284c7; }
  .eye-btn svg { width: 15px; height: 15px; }

  .vendor-note {
    padding: 8px 12px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    font-size: 0.72rem;
    color: #0284c7;
  }

  .vendor-fields {
    padding: 0.75rem;
    background: #f0f9ff;
    border-radius: 10px;
    border: 1px solid #bae6fd;
    margin-bottom: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .btn-primary {
    width: 100%;
    padding: 0.7rem;
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
    margin-top: 0.25rem;
  }

  .btn-primary:hover:not(:disabled) { background: #0369a1; }
  .btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-outline {
    width: 100%;
    padding: 0.68rem;
    background: white;
    color: #374151;
    font-size: 0.825rem;
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
    text-decoration: none;
  }

  .btn-outline:hover { background: #f9fafb; border-color: #d1d5db; }

  .divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0.75rem 0;
  }

  .divider-line { flex: 1; height: 1px; background: #e5e7eb; }
  .divider span { font-size: 0.68rem; color: #9ca3af; font-weight: 500; }

  .bottom-link {
    text-align: center;
    margin-top: 0.6rem;
    font-size: 0.72rem;
    color: #6b7280;
  }

  .bottom-link a {
    color: #0284c7;
    font-weight: 600;
    text-decoration: none;
    margin-left: 4px;
  }

  .spin {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }

  .spin-blue {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(2,132,199,0.2);
    border-top-color: #0284c7;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* OTP Step */
  .otp-icon-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .otp-icon {
    width: 52px;
    height: 52px;
    background: #f0f9ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .otp-icon svg { width: 26px; height: 26px; color: #0284c7; }

  .otp-input {
    width: 100%;
    padding: 0.85rem 1rem;
    text-align: center;
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 0.5em;
    font-family: 'Poppins', sans-serif;
    background: #f3f4f6;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    outline: none;
    color: #111827;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .otp-input:focus {
    border-color: #0284c7;
    background: white;
    box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.08);
  }

  .otp-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.75rem;
  }

  .text-link {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.73rem;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    color: #0284c7;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
    padding: 0;
  }

  .text-link:hover { color: #0369a1; }
  .text-link:disabled { opacity: 0.5; cursor: not-allowed; }
  .text-link svg { width: 13px; height: 13px; }

  .google-wrap > div { border-radius: 10px !important; overflow: hidden; }

  @media (max-width: 640px) {
    .auth-left { display: none; }
    .auth-right { padding: 2rem 1.5rem; }
    .auth-card { max-width: 420px; }
  }
`;

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

  const LockIcon = () => (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const MailIcon = () => (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

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
              <h2>{step === 1 ? 'JOIN US' : 'VERIFY'}</h2>
              <h3>{step === 1 ? 'Create Your Account' : 'Email Verification'}</h3>
              <p>{step === 1
                ? 'Sign up to get started. Join thousands of users who trust our platform.'
                : `We sent a 6-digit code to ${formData.email}. Check your inbox.`}
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="auth-right">
            <h1>{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
            <p className="subtitle">
              {step === 1 ? 'Join us today — it\'s free!' : `Enter the code sent to ${formData.email}`}
            </p>

            {step === 1 ? (
              <>
                {/* Account Type Toggle */}
                <div className="type-toggle">
                  <button
                    type="button"
                    className={`type-btn ${accountType === 'user' ? 'active' : ''}`}
                    onClick={() => setAccountType('user')}
                  >
                    <User size={14} /> User
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${accountType === 'vendor' ? 'active' : ''}`}
                    onClick={() => setAccountType('vendor')}
                  >
                    <Store size={14} /> Vendor
                  </button>
                </div>

                {/* Google Login (user only) */}
                {accountType === 'user' && (
                  <>
                    <div className="google-wrap">
                      {googleLoading ? (
                        <button className="btn-outline" disabled>
                          <span className="spin-blue" />
                          Creating account...
                        </button>
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
                    <div className="divider">
                      <div className="divider-line" />
                      <span>or register with email</span>
                      <div className="divider-line" />
                    </div>
                  </>
                )}

                {/* Vendor note */}
                {accountType === 'vendor' && (
                  <div className="vendor-note">
                    🏪 Vendor accounts require email verification and admin approval.
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrap">
                      <UserIcon />
                      <input type="text" name="name" value={formData.name} onChange={handleChange}
                        placeholder="John Doe" className="field-input" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-wrap">
                      <MailIcon />
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="you@example.com" className="field-input" required />
                    </div>
                  </div>

                  {accountType === 'vendor' && (
                    <div className="vendor-fields">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Business Name</label>
                        <input type="text" name="businessName" value={formData.businessName} onChange={handleChange}
                          placeholder="Your Business" className="field-input no-icon" required />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Business Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}
                          placeholder="Tell us about your business..." className="field-textarea" rows="2" required />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrap">
                      <LockIcon />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                        onChange={handleChange} placeholder="Create password"
                        className="field-input" style={{ paddingRight: '2.5rem' }} required />
                      <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-wrap">
                      <LockIcon />
                      <input type={showPassword ? 'text' : 'password'} name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleChange}
                        placeholder="Repeat password" className="field-input" required />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? <><span className="spin" /> Processing...</> : 'Continue'}
                  </button>
                </form>
              </>
            ) : (
              /* OTP Step */
              <form onSubmit={handleVerifyOTP}>
                <div className="otp-icon-wrap">
                  <div className="otp-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ textAlign: 'center', display: 'block' }}>Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="otp-input"
                    maxLength="6"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading
                    ? <><span className="spin" /> Verifying...</>
                    : <><CheckCircle size={16} /> Verify &amp; Complete</>
                  }
                </button>

                <div className="otp-actions">
                  <button type="button" className="text-link" onClick={handleResendOTP} disabled={isLoading}>
                    Resend Code
                  </button>
                  <button type="button" className="text-link" onClick={() => setStep(1)}>
                    <ArrowLeft /> Back
                  </button>
                </div>
              </form>
            )}

            <div className="divider">
              <div className="divider-line" />
              <span>Or</span>
              <div className="divider-line" />
            </div>

            <Link to="/login" className="btn-outline">Sign In</Link>

            <p className="bottom-link">
              Already have an account?
              <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
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