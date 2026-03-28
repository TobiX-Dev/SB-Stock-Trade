import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

export default function Login() {
  const { login } = useGeneral();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showTOTPModal, setShowTOTPModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSuccess
      });
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleSuccess = async (response) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/users/google-auth', { idToken: response.credential });
      if (data.requiresUsernameSetup) {
        // Handle username setup modal later
        localStorage.setItem('pendingUsernameSetup', JSON.stringify(data));
        navigate('/set-username');
        return;
      }
      login(data);
      toast.success('Google login successful!');
      navigate(data.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/users/login', form);
      if (data.requiresOTP) {
        setLoginEmail(data.email);
        setTempToken(data.tempToken);
        setShowOTPModal(true);
        setOtpCode('');
      } else if (data.requiresTOTP) {
        setTempToken(data.tempToken);
        setShowTOTPModal(true);
        setTotpCode('');
      } else {
        login(data);
        toast.success(`Welcome back, ${data.username}!`);
        navigate(data.role === 'admin' ? '/admin' : '/home');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      // Check if user doesn't exist (Invalid email or password)
      if (errorMsg.toLowerCase().includes('invalid email') || errorMsg.toLowerCase().includes('invalid email or password')) {
        toast.error('Account not found! Please register first.');
        setTimeout(() => navigate('/register'), 1500);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!forgotEmail) return toast.error('Enter your email');
    try {
      setLoading(true);
      await axiosInstance.post('/users/forgot-password', { email: forgotEmail });
      toast.success('Reset code sent to your email');
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword) return toast.error('Please fill all fields');
    try {
      setLoading(true);
      await axiosInstance.post('/users/reset-password', { email: forgotEmail, code: resetCode, newPassword });
      toast.success('Password reset successful! Please login');
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail('');
      setResetCode('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const handleTOTPVerify = async () => {
    if (!totpCode) return toast.error('Enter verification code');
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/users/verify-totp', { tempToken, code: totpCode });
      login({ ...data, token: data.token });
      toast.success('Verification successful!');
      setShowTOTPModal(false);
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    if (!otpCode) return toast.error('Enter verification code');
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/users/verify-email', { email: loginEmail, code: otpCode, isLogin: true });
      if (data.requiresTOTP) {
        setTempToken(data.tempToken);
        setShowOTPModal(false);
        setShowTOTPModal(true);
        setTotpCode('');
      } else {
        login({ token: data.token });
        toast.success('Login successful!');
        setShowOTPModal(false);
        navigate('/home');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-teal/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center">
              <span className="text-night font-display font-bold text-sm">SB</span>
            </div>
            <span className="font-display text-2xl font-bold text-white">SB<span className="text-teal">Stocks</span></span>
          </Link>
          <p className="text-slate-500 mt-2 text-sm">Sign in to your trading account</p>
        </div>

        <div className="card border-night-300 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="trader@example.com" className="input" autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" className="input" autoComplete="current-password" />
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={() => { setShowForgotModal(true); setForgotStep(1); }} className="text-xs text-teal hover:underline">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-night-300"></div>
            <span className="text-xs text-slate-500">or</span>
            <div className="h-px flex-1 bg-night-300"></div>
          </div>

          <button onClick={() => window.google?.accounts.id.prompt()} className="btn-primary w-full">
            Sign in with Google 🔐
          </button>

          {/* Demo credentials */}
          <div className="p-3 bg-night-300 rounded-lg border border-night-300">
            <p className="text-xs text-slate-500 font-mono mb-1">Demo Admin Account:</p>
            <p className="text-xs text-slate-400 font-mono">charpachi04@gmail.com / Admin123</p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            No account?{' '}
            <Link to="/register" className="text-teal hover:underline font-medium">Create one free</Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-night-300 rounded-2xl border border-night-300 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Reset Password</h2>
            {forgotStep === 1 ? (
              <>
                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Enter your email" className="input w-full mb-4" />
                <button onClick={handleForgotPasswordRequest} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </>
            ) : (
              <>
                <input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="Enter 6-digit code" className="input w-full mb-3" maxLength="6" />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="input w-full mb-4" />
                <button onClick={handleResetPassword} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
            <button onClick={() => { setShowForgotModal(false); setForgotStep(1); }} className="w-full mt-3 text-slate-500 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* OTP Verification Modal (for Login) */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-night-300 rounded-2xl border border-night-300 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Enter Login Code</h2>
            <p className="text-sm text-slate-500 mb-4">A verification code has been sent to <br/><span className="text-teal">{loginEmail}</span></p>
            <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.slice(0, 6))} placeholder="000000" className="input w-full text-center text-2xl tracking-widest mb-4" maxLength="6" />
            <button onClick={handleOTPVerify} disabled={loading} className="btn-primary w-full mb-3">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button onClick={() => setShowOTPModal(false)} className="w-full text-slate-500 hover:text-white text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TOTP Verification Modal */}
      {showTOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-night-300 rounded-2xl border border-night-300 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Enter 2FA Code</h2>
            <p className="text-sm text-slate-500 mb-4">Enter the 6-digit code from your authenticator app</p>
            <input type="text" value={totpCode} onChange={(e) => setTotpCode(e.target.value.slice(0, 6))} placeholder="000000" className="input w-full text-center text-2xl tracking-widest mb-4" maxLength="6" />
            <button onClick={handleTOTPVerify} disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
