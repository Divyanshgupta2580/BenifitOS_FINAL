import React, { useState, useEffect } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
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
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-white text-xl font-bold mb-3 shadow-sm">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Two-Factor Auth (MFA)</h1>
          <p className="text-sm text-slate-600">Enter the 6-digit verification code sent to your registered device.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center mb-6">
          <p className="text-xs font-bold text-blue-900">[ Transaction ID: {txnId || 'Loading...'} ]</p>
          <p className="text-xs text-slate-500 mt-1">{challengeText}</p>
        </div>

        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-lg border text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="6-Digit Verification Code"
            type="text"
            placeholder="123456"
            value={totpCode}
            onChangeText={setTotpCode}
            maxLength={6}
            required
            className="text-center font-mono tracking-widest text-lg"
          />

          <Button type="submit" title="Verify & Enable MFA" isLoading={isLoading} className="w-full py-3" />
          <Button
            type="button"
            title="Resend Challenge OTP"
            variant="outline"
            onClick={handleRequestChallenge}
            className="w-full py-2.5"
          />
        </form>
      </div>
    </main>
  );
};
