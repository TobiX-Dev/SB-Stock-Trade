import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

export default function Register() {
  const { login } = useGeneral();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      
      // If username setup is required, navigate to setup page
      if (data.requiresUsernameSetup) {
        navigate('/set-username', { 
          state: { 
            userId: data.userId, 
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
          } 
        });
        toast.info('Please complete your profile setup');
      } else {
        // Existing user, log in directly
        login(data);
        toast.success('Google login successful!');
        navigate('/home');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password) 
      return toast.error('Fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/users/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username, 
        email: form.email, 
        password: form.password, 
        phone: form.phone
      });
      setRegisteredEmail(form.email);
      setShowOTPModal(true);
      setOtpCode('');
      toast.success('Verification code sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    if (!otpCode) return toast.error('Enter the 6-digit code');
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/users/verify-email', { email: registeredEmail, code: otpCode });
      login(data);
      toast.success('Email verified! Account created 🎉');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-teal/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center">
              <span className="text-night font-display font-bold text-sm">SB</span>
            </div>
            <span className="font-display text-2xl font-bold text-white">SB<span className="text-teal">Stocks</span></span>
          </Link>
          <p className="text-slate-500 mt-2 text-sm">Create your free trading account</p>
        </div>

        <div className="card shadow-2xl">
          {/* Bonus badge */}
          <div className="bg-teal-dim border border-teal/20 rounded-lg p-3 mb-5 flex items-center gap-2">
            <span className="text-teal text-lg">🎁</span>
            <div>
              <p className="text-teal text-xs font-semibold">Welcome Bonus</p>
              <p className="text-slate-400 text-xs">$100,000 virtual funds to start trading immediately</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name <span className="text-crimson">*</span></label>
                <input name="firstName" value={form.firstName} onChange={handleChange}
                  placeholder="John" className="input text-sm" />
              </div>
              <div>
                <label className="label">Last Name <span className="text-crimson">*</span></label>
                <input name="lastName" value={form.lastName} onChange={handleChange}
                  placeholder="Doe" className="input text-sm" />
              </div>
            </div>
            <div>
              <label className="label">Username <span className="text-crimson">*</span></label>
              <input name="username" value={form.username} onChange={handleChange}
                placeholder="trader_pro" className="input" />
            </div>
            <div>
              <label className="label">Email <span className="text-crimson">*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+1 234 567 8900" className="input" />
            </div>
            <div>
              <label className="label">Password <span className="text-crimson">*</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" className="input" />
            </div>
            <div>
              <label className="label">Confirm Password <span className="text-crimson">*</span></label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat password" className="input" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating Account...' : 'Create Account & Start Trading →'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-night-300"></div>
            <span className="text-xs text-slate-500">or</span>
            <div className="h-px flex-1 bg-night-300"></div>
          </div>

          <button onClick={() => window.google?.accounts.id.prompt()} className="btn-primary w-full">
            Sign up with Google 🔐
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-teal hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-night-300 rounded-2xl border border-night-300 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-sm text-slate-500 mb-4">Enter the 6-digit code we sent to <br/><span className="text-teal">{registeredEmail}</span></p>
            <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.slice(0, 6))} 
              placeholder="000000" className="input w-full text-center text-2xl tracking-widest mb-4" maxLength="6" />
            <button onClick={handleOTPVerify} disabled={loading} className="btn-primary w-full mb-3">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button onClick={() => setShowOTPModal(false)} className="w-full text-slate-500 hover:text-white text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
