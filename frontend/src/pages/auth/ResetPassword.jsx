import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';

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
    max-width: 820px;
    background: white;
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    min-height: 460px;
    box-shadow: 0 32px 80px rgba(3, 105, 161, 0.35);
  }

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

  .circle-deco { position: absolute; border-radius: 50%; }

  .circle-1 {
    width: 180px; height: 180px;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(2, 132, 199, 0.5));
    border: 1px solid rgba(255,255,255,0.15);
    bottom: 60px; left: 50%; transform: translateX(-50%);
    box-shadow: inset 0 0 40px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.2);
  }
  .circle-2 {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.4), rgba(3, 105, 161, 0.6));
    border: 1px solid rgba(255,255,255,0.2);
    bottom: 30px; right: 20px;
    box-shadow: inset 0 0 20px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.15);
  }
  .circle-3 {
    width: 55px; height: 55px;
    background: linear-gradient(135deg, rgba(125, 211, 252, 0.3), rgba(2, 132, 199, 0.4));
    border: 1px solid rgba(255,255,255,0.15);
    top: 50px; right: 30px;
  }

  .left-content { position: relative; z-index: 2; }
  .left-content h2 { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.4rem; letter-spacing: -0.5px; }
  .left-content h3 { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.75); letter-spacing: 2px; text-transform: uppercase; margin: 0 0 1.2rem; }
  .left-content p { font-size: 0.73rem; color: rgba(255,255,255,0.55); line-height: 1.6; margin: 0; max-width: 220px; }

  .auth-right {
    flex: 1;
    padding: 2.5rem 2.8rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .auth-right h1 { font-size: 1.7rem; font-weight: 700; color: #111827; margin: 0 0 0.25rem; }
  .auth-right .subtitle { font-size: 0.73rem; color: #9ca3af; margin: 0 0 1.8rem; }

  .form-group { margin-bottom: 1rem; }
  .form-group label { display: block; font-size: 0.7rem; font-weight: 600; color: #374151; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.5px; }

  .input-wrap { position: relative; }
  .input-wrap svg.icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; width: 16px; height: 16px; }

  .field-input {
    width: 100%;
    padding: 0.65rem 2.5rem 0.65rem 2.5rem;
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
  .field-input:focus { border-color: #0284c7; background: white; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.08); }
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
    transition: color 0.2s;
  }
  .eye-btn:hover { color: #0284c7; }
  .eye-btn svg { width: 15px; height: 15px; }

  .error-hint { font-size: 0.7rem; color: #ef4444; margin-top: 4px; }

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
  }
  .btn-primary:hover:not(:disabled) { background: #0369a1; }
  .btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .divider { display: flex; align-items: center; gap: 10px; margin: 1rem 0; }
  .divider-line { flex: 1; height: 1px; background: #e5e7eb; }
  .divider span { font-size: 0.7rem; color: #9ca3af; font-weight: 500; }

  .text-link-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 0.73rem;
    color: #6b7280;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
  }
  .text-link-center:hover { color: #374151; }
  .text-link-center svg { width: 13px; height: 13px; transition: transform 0.2s; }
  .text-link-center:hover svg { transform: translateX(-2px); }

  .success-icon { display: flex; justify-content: center; margin-bottom: 1rem; }
  .success-icon-inner { width: 56px; height: 56px; background: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .success-icon-inner svg { width: 28px; height: 28px; color: #16a34a; }

  .spin {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 640px) {
    .auth-left { display: none; }
    .auth-right { padding: 2rem 1.5rem; }
    .auth-card { max-width: 420px; }
  }
`;

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

  const LockIcon = () => (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
              <h2>{done ? 'ALL DONE!' : 'RESET'}</h2>
              <h3>{done ? 'Password Updated' : 'Your Password'}</h3>
              <p>{done
                ? 'Your password has been updated. You can now sign in with your new credentials.'
                : 'Choose a strong new password to keep your account secure.'
              }</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="auth-right">
            <h1>{done ? 'Password Reset!' : 'Set New Password'}</h1>
            <p className="subtitle">
              {done ? 'You can now sign in with your new password' : 'Choose a strong new password'}
            </p>

            {!done ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrap">
                    <LockIcon />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter new password"
                      className="field-input"
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-wrap">
                    <LockIcon />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      className="field-input"
                      required
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="error-hint">Passwords do not match</p>
                  )}
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? <><span className="spin" /> Resetting...</> : 'Reset Password'}
                </button>

                <div className="divider">
                  <div className="divider-line" />
                  <span>OR</span>
                  <div className="divider-line" />
                </div>

                <Link to="/login" className="text-link-center">
                  <ArrowLeft /> Back to Sign In
                </Link>
              </form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div className="success-icon">
                  <div className="success-icon-inner">
                    <CheckCircle />
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem' }}>All done!</p>
                <p style={{ fontSize: '0.73rem', color: '#9ca3af', margin: '0 0 1.2rem' }}>
                  Your password has been updated successfully.
                </p>
                <button className="btn-primary" onClick={() => navigate('/login')}>
                  Go to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;