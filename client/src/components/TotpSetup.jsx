import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';

export default function TOTPSetup() {
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [otpauth, setOtpauth] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetupTOTP = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/users/totp/setup');
      setQrCode(data.qr);
      setOtpauth(data.otpauth_url);
      setShowModal(true);
      setCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to setup TOTP');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableTOTP = async () => {
    if (!code) return toast.error('Enter the 6-digit code');
    try {
      setLoading(true);
      await axiosInstance.post('/users/totp/enable', { code });
      toast.success('2FA enabled! You will need to enter a code when logging in.');
      setShowModal(false);
      setCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleSetupTOTP} disabled={loading} className="btn-secondary">
        {loading ? 'Setting up...' : 'Enable 2FA (Google Authenticator)'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-night-300 rounded-2xl border border-night-300 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Setup Google Authenticator</h2>
            
            <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
              {qrCode && <img src={qrCode} alt="QR Code" className="w-48 h-48" />}
            </div>

            <p className="text-sm text-slate-500 mb-3">
              1. Scan this QR code with Google Authenticator, Microsoft Authenticator, or Authy
            </p>
            <p className="text-sm text-slate-500 mb-4">
              2. Or enter this key manually: <br/>
              <span className="font-mono text-teal font-bold text-xs break-all">{otpauth}</span>
            </p>

            <div className="mb-4">
              <label className="label text-white">Enter the 6-digit code from your app:</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value.slice(0, 6))} 
                placeholder="000000" className="input w-full text-center text-2xl tracking-widest" maxLength="6" />
            </div>

            <button onClick={handleEnableTOTP} disabled={loading || !code} className="btn-primary w-full mb-3">
              {loading ? 'Enabling...' : 'Enable 2FA'}
            </button>
            <button onClick={() => setShowModal(false)} className="w-full text-slate-500 hover:text-white text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
