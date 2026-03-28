import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [savingResponse, setSavingResponse] = useState(false);

  useEffect(() => {
    loadFeedbacks();
    const interval = setInterval(loadFeedbacks, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadFeedbacks = async () => {
    try {
      const { data } = await axiosInstance.get('/api/feedback/all');
      setFeedbacks(data);
    } catch (error) {
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.phone.includes(searchTerm) ||
                         f.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      await axiosInstance.put(`/api/feedback/${feedbackId}`, { 
        status: newStatus,
        response: responseText
      });
      toast.success('Feedback updated');
      setSelectedFeedback(null);
      setResponseText('');
      loadFeedbacks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setSavingResponse(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await axiosInstance.delete(`/api/feedback/${feedbackId}`);
      toast.success('Feedback deleted');
      loadFeedbacks();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-[#080c14] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#00d4aa] mb-8">Customer Feedback & Issues</h1>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name, phone, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00d4aa]"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Feedbacks List */}
        {loading ? (
          <div className="text-center text-gray-400">Loading feedbacks...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No feedbacks found</div>
        ) : (
          <div className="grid gap-4">
            {filteredFeedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="bg-[#0a0f1a] border border-[#00d4aa]/20 rounded-lg p-5 hover:border-[#00d4aa]/50 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{feedback.userName}</h3>
                    <p className="text-sm text-gray-400">📱 {feedback.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className={`border rounded px-3 py-1 text-sm font-semibold ${getStatusColor(feedback.status)}`}>
                    {feedback.status.toUpperCase()}
                  </div>
                </div>

                <p className="text-gray-300 mb-4 bg-[#1a1f2e] p-3 rounded border border-[#00d4aa]/10">
                  {feedback.issue}
                </p>

                {feedback.response && (
                  <div className="mb-4 bg-[#00d4aa]/10 border border-[#00d4aa]/20 p-3 rounded">
                    <p className="text-xs text-[#00d4aa] font-semibold mb-1">Admin Response:</p>
                    <p className="text-sm text-gray-300">{feedback.response}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedFeedback(feedback)}
                    className="px-3 py-1 text-sm bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold rounded transition"
                  >
                    Respond
                  </button>
                  <select
                    value={feedback.status}
                    onChange={(e) => handleUpdateStatus(feedback._id, e.target.value)}
                    className="px-2 py-1 text-sm bg-[#1a1f2e] border border-[#00d4aa]/30 text-white rounded focus:outline-none focus:border-[#00d4aa]"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => handleDeleteFeedback(feedback._id)}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0a0f1a] border border-[#00d4aa]/20 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#00d4aa] mb-4">
              Respond to {selectedFeedback.userName}
            </h2>

            <div className="mb-4 p-3 bg-[#1a1f2e] rounded border border-[#00d4aa]/10">
              <p className="text-sm text-gray-300">{selectedFeedback.issue}</p>
            </div>

            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response..."
              rows="4"
              className="w-full bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] mb-4 resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedFeedback(null);
                  setResponseText('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSavingResponse(true);
                  handleUpdateStatus(selectedFeedback._id, selectedFeedback.status);
                }}
                disabled={savingResponse || !responseText.trim()}
                className="flex-1 bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 text-black font-bold py-2 rounded transition"
              >
                {savingResponse ? 'Saving...' : 'Save Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
