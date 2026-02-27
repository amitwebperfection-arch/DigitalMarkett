import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

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
  .field-input:focus { border-color: #0284c7; background: white; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.08); }
  .field-input::placeholder { color: #9ca3af; }

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
    text-decoration: none;
  }
  .btn-outline:hover { background: #f9fafb; border-color: #d1d5db; }

  .divider { display: flex; align-items: center; gap: 10px; margin: 1rem 0; }
  .divider-line { flex: 1; height: 1px; background: #e5e7eb; }
  .divider span { font-size: 0.7rem; color: #9ca3af; font-weight: 500; }

  .text-link-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 0.73rem;
    color: #0284c7;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
    margin-top: 0.5rem;
  }
  .text-link-center:hover { color: #0369a1; }
  .text-link-center svg { width: 13px; height: 13px; transition: transform 0.2s; }
  .text-link-center:hover svg { transform: translateX(-2px); }

  .success-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .success-icon-inner {
    width: 56px; height: 56px;
    background: #f0fdf4;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

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

  .try-again-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.73rem;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    color: #6b7280;
    text-decoration: underline;
    display: block;
    margin: 0.5rem auto 0;
    transition: color 0.2s;
  }
  .try-again-btn:hover { color: #374151; }

  @media (max-width: 640px) {
    .auth-left { display: none; }
    .auth-right { padding: 2rem 1.5rem; }
    .auth-card { max-width: 420px; }
  }
`;

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
              <h2>{sent ? 'CHECK' : 'FORGOT'}</h2>
              <h3>{sent ? 'Your Inbox' : 'Your Password?'}</h3>
              <p>{sent
                ? `We've sent a password reset link to ${email}. Check your spam folder too.`
                : "No worries! Enter your email and we'll send you a reset link right away."
              }</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="auth-right">
            <h1>{sent ? 'Check your inbox' : 'Forgot Password'}</h1>
            <p className="subtitle">
              {sent ? `Reset link sent to ${email}` : "We'll send you a reset link"}
            </p>

            {!sent ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrap">
                    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="field-input"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? <><span className="spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div className="success-icon">
                  <div className="success-icon-inner">
                    <CheckCircle />
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem' }}>Reset link sent!</p>
                <p style={{ fontSize: '0.73rem', color: '#9ca3af', margin: '0 0 0.75rem' }}>
                  Check your spam folder if you don't see it in a few minutes.
                </p>
                <button className="try-again-btn" onClick={() => { setSent(false); setEmail(''); }}>
                  Try a different email
                </button>
              </div>
            )}

            <div className="divider">
              <div className="divider-line" />
              <span>OR</span>
              <div className="divider-line" />
            </div>

            <Link to="/login" className="btn-outline">Back to Sign In</Link>

            <Link to="/" className="text-link-center" style={{ marginTop: '0.75rem' }}>
              <ArrowLeft /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;