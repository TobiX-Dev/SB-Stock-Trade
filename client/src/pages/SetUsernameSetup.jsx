import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

export default function SetUsernameSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useGeneral();
  const [firstName, setFirstName] = useState(location.state?.firstName || '');
  const [lastName, setLastName] = useState(location.state?.lastName || '');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      toast.error('All fields are required');
      return;
    }
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/users/set-username', {
        userId: location.state?.userId,
        firstName,
        lastName,
        username
      });

      toast.success('Profile setup complete!');
      login(data.user, data.token);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080c14] to-[#0a0f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0a0f1a] border border-[#00d4aa]/20 rounded-lg p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center text-[#00d4aa] mb-2">Complete Your Profile</h1>
          <p className="text-center text-gray-400 mb-6">Set up your profile information</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]"
                placeholder="Choose a username (min 3 chars)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
