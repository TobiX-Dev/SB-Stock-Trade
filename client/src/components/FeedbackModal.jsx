import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';

export default function FeedbackModal() {
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !issue.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/api/feedback/submit', { phone, issue });
      toast.success('Thank you! Your feedback has been submitted.');
      setPhone('');
      setIssue('');
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#00d4aa] hover:bg-[#00b894] text-black flex items-center justify-center shadow-lg z-40 transition-all duration-200 hover:scale-110"
        title="Send Feedback"
      >
        <span className="text-2xl">💬</span>
      </button>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0a0f1a] border border-[#00d4aa]/20 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00d4aa]">Send Feedback</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Help us improve! Share any issues or feedback about your experience.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Issue / Feedback</label>
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Describe your problem or suggestion..."
                  rows="4"
                  className="w-full bg-[#1a1f2e] border border-[#00d4aa]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  {loading ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
