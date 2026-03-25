import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

export default function Login() {
  const { login } = useGeneral();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/users/login', form);
      login(data);
      toast.success(`Welcome back, ${data.username}!`);
      navigate(data.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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

            <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2">
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

          {/* Demo credentials */}
          <div className="mt-5 p-3 bg-night-300 rounded-lg border border-night-300">
            <p className="text-xs text-slate-500 font-mono mb-1">Demo Admin Account:</p>
            <p className="text-xs text-slate-400 font-mono">admin@sbstocks.com / Admin@123</p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            No account?{' '}
            <Link to="/register" className="text-teal hover:underline font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
