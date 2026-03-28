import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';

export default function AdminBonus() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [bonusAmount, setBonusAmount] = useState('');
  const [reason, setReason] = useState('');
  const [savingBonus, setSavingBonus] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await axiosInstance.get('/users/all');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  );

  const handleAddBonus = async () => {
    if (!selectedUser || !bonusAmount) {
      toast.error('Please select user and enter bonus amount');
      return;
    }

    const amount = parseFloat(bonusAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Bonus amount must be a positive number');
      return;
    }

    setSavingBonus(true);
    try {
      await axiosInstance.put(`/users/${selectedUser._id}`, {
        balance: selectedUser.balance + amount
      });
      
      toast.success(`✅ Added $${amount.toFixed(2)} bonus to ${selectedUser.username}`);
      
      // Update user in list
      setUsers(users.map(u => 
        u._id === selectedUser._id 
          ? { ...u, balance: u.balance + amount }
          : u
      ));
      
      setSelectedUser(null);
      setBonusAmount('');
      setReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add bonus');
    } finally {
      setSavingBonus(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-[#080c14] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#00d4aa] mb-2">Bonus Management</h1>
        <p className="text-gray-400 mb-8">Add bonus funds to customers who need support</p>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search users by username, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Users</h2>
            {loading ? (
              <div className="text-gray-400">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-gray-400">No users found</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.map(user => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedUser?._id === user._id
                        ? 'border-[#00d4aa] bg-[#00d4aa]/10'
                        : 'border-[#00d4aa]/20 bg-[#0a0f1a] hover:border-[#00d4aa]/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">{user.username}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.phone || 'No phone'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[#00d4aa] font-bold">
                          ${user.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">{user.role.toUpperCase()}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bonus Form */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Add Bonus</h2>
            <div className="bg-[#0a0f1a] border border-[#00d4aa]/20 rounded-lg p-6">
              {selectedUser ? (
                <div className="space-y-4">
                  {/* Selected User Info */}
                  <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#00d4aa]/10">
                    <p className="text-sm text-gray-400 mb-1">Selected User</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{selectedUser.username}</p>
                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Current Balance</p>
                        <p className="font-mono text-[#00d4aa] font-bold">
                          ${selectedUser.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bonus Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bonus Amount ($)</label>
                    <input
                      type="number"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(e.target.value)}
                      placeholder="e.g., 500"
                      className="w-full bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa]"
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Reason (Optional)</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g., User lost funds due to market crash, promotional bonus..."
                      rows="3"
                      className="w-full bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] resize-none"
                    />
                  </div>

                  {/* New Balance Preview */}
                  {bonusAmount && (
                    <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-lg p-3">
                      <p className="text-sm text-gray-400 mb-1">New Balance After Bonus</p>
                      <p className="font-mono text-[#00d4aa] text-xl font-bold">
                        ${(selectedUser.balance + parseFloat(bonusAmount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setBonusAmount('');
                        setReason('');
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddBonus}
                      disabled={savingBonus || !bonusAmount}
                      className="flex-1 bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 text-black font-bold py-2 px-4 rounded-lg transition"
                    >
                      {savingBonus ? 'Adding...' : 'Add Bonus'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">Select a user from the list to add bonus</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
