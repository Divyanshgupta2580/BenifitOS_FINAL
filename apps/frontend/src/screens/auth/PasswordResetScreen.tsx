import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/api-client';

interface Props {
  onBackToLogin: () => void;
}

export const PasswordResetScreen: React.FC<Props> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!email) {
      setStatusMessage({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setStatusMessage({
        type: 'success',
        text: `If an account exists for ${email}, a password reset link has been sent to your inbox.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'success',
        text: `If an account exists for ${email}, password reset instructions have been dispatched.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-white text-xl font-bold mb-3 shadow-sm">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Reset Password</h1>
          <p className="text-sm text-slate-600">Enter your email address to receive password reset instructions.</p>
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

        <form onSubmit={handleResetRequest} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="citizen@example.com"
            value={email}
            onChangeText={setEmail}
            required
            autoComplete="email"
          />

          <Button type="submit" title="Send Reset Link" isLoading={isLoading} className="w-full py-3" />
          <Button
            type="button"
            title="Back to Sign In"
            variant="outline"
            onClick={onBackToLogin}
            className="w-full py-2.5"
          />
        </form>
      </div>
    </main>
  );
};
