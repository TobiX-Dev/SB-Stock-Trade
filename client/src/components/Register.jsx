import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

export default function Register() {
  const { login } = useGeneral();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error('Fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/users/register', {
        username: form.username, email: form.email, password: form.password, phone: form.phone
      });
      login(data);
      toast.success('Account created! $100,000 virtual funds added 🎉');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating Account...' : 'Create Account & Start Trading →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-teal hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
