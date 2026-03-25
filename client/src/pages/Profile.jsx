import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

export default function Profile() {
  const { user, login } = useGeneral();
  const [form, setForm] = useState({ username: user?.username || '', phone: user?.phone || '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    try {
      setLoading(true);
      const payload = { username: form.username, phone: form.phone };
      if (form.password) payload.password = form.password;
      const { data } = await axiosInstance.put('/users/profile', payload);
      login(data);
      toast.success('Profile updated!');
      setEditing(false);
      setForm({ ...form, password: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account details</p>
        </div>

        {/* Profile card */}
        <div className="card mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-dim border border-teal/20 flex items-center justify-center text-3xl font-mono text-teal font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-white text-xl font-bold">{user?.username}</h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block font-medium ${
                user?.role === 'admin' ? 'bg-gold/10 text-gold' : 'bg-teal-dim text-teal'
              }`}>{user?.role?.toUpperCase()}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-night-300 rounded-lg p-3">
              <p className="label">Virtual Balance</p>
              <p className="font-mono text-teal text-xl font-bold">
                ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-night-300 rounded-lg p-3">
              <p className="label">Member Since</p>
              <p className="text-white font-medium">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {!editing ? (
            <div className="space-y-3">
              {[
                { label: 'Username', value: user?.username },
                { label: 'Email',    value: user?.email },
                { label: 'Phone',    value: user?.phone || 'Not set' },
              ].map(f => (
                <div key={f.label} className="flex justify-between items-center py-2 border-b border-night-300">
                  <span className="text-slate-500 text-sm">{f.label}</span>
                  <span className="text-white text-sm font-medium">{f.value}</span>
                </div>
              ))}
              <button onClick={() => setEditing(true)} className="btn-ghost w-full mt-2">Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <input name="username" value={form.username} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Email (read-only)</label>
                <input value={user?.email} disabled className="input opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" className="input" />
              </div>
              <div>
                <label className="label">New Password (leave blank to keep current)</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="New password" className="input" />
              </div>
              {form.password && (
                <div>
                  <label className="label">Confirm New Password</label>
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" className="input" />
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security info */}
        <div className="card border-night-300">
          <h3 className="font-display text-white font-semibold mb-3 text-sm">Security & Platform</h3>
          <div className="space-y-2 text-sm text-slate-500">
            <p>🔒 Your password is securely hashed with bcrypt</p>
            <p>🪙 Virtual funds — no real money involved</p>
            <p>📊 All trades use live Finnhub market data</p>
            <p>🔑 Sessions managed with secure JWT tokens</p>
          </div>
        </div>
      </div>
    </div>
  );
}
