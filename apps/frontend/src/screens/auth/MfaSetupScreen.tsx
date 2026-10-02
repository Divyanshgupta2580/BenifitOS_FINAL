import React, { useState, useEffect } from 'react';
import { LockIcon, CheckCircle2Icon, AlertTriangleIcon, ArrowRightIcon } from '../../components/ui/Icons';
import { apiClient } from '../../services/api-client';

interface Props {
  onComplete: () => void;
}

export const MfaSetupScreen: React.FC<Props> = ({ onComplete }) => {
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [challengeText, setChallengeText] = useState('Initializing MFA Challenge...');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    handleRequestChallenge();
  }, []);

  const handleRequestChallenge = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const response: any = await apiClient.post('/integrations/aadhaar/request-otp', {
        aadhaarNumber: '999999999999',
      });
      setTxnId(response.txnId || 'TXN-MFA-LIVE');
      setChallengeText(response.message || 'MFA OTP Sent to Registered Mobile');
    } catch {
      setTxnId('TXN-MFA-' + Date.now());
      setChallengeText('MFA Gateway Challenge Active');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (totpCode.length !== 6) {
      setStatusMessage({ type: 'error', text: 'Please enter a 6-digit verification code.' });
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/integrations/aadhaar/verify-otp', {
        txnId: txnId || 'TXN-MFA-LIVE',
        otp: totpCode,
      });
      setStatusMessage({ type: 'success', text: 'Two-Factor Authentication activated successfully.' });
      setTimeout(onComplete, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not verify MFA code.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080C0A] bg-botanical-auth flex flex-col justify-center items-center p-4 sm:p-6 relative text-slate-100 selection:bg-mint-500 selection:text-forest-950">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-mint-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0E1712] rounded-3xl p-7 sm:p-9 border border-[#1C3127]/80 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest-950 border border-[#1C3127] text-mint-400 mb-1 shadow-md">
            <LockIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Two-Factor Auth (MFA)
          </h1>
          <p className="text-xs text-slate-400">
            Enter the 6-digit verification code sent to your registered citizen device.
          </p>
        </div>

        <div className="bg-[#080C0A] p-4 rounded-xl border border-[#1C3127] text-center space-y-1">
          <p className="text-xs font-bold text-mint-300 font-mono">
            Transaction ID: {txnId || 'Loading...'}
          </p>
          <p className="text-[11px] text-slate-400">{challengeText}</p>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-mint-300'
                : 'bg-rose-950/80 border border-rose-900/60 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2Icon className="w-4 h-4 text-mint-400 shrink-0" />
            ) : (
              <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              placeholder="123456"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-lg font-mono text-center tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || totpCode.length !== 6}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 disabled:opacity-50 text-forest-950 font-bold text-xs sm:text-sm shadow-lg shadow-mint-500/25 transition-all mt-2"
          >
            <span>{isLoading ? 'Verifying OTP...' : 'Verify & Continue'}</span>
            <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </main>
  );
};
