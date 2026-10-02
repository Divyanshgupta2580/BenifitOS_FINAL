import React, { useState } from 'react';
import { KeyIcon, CheckCircle2Icon, AlertTriangleIcon, ArrowRightIcon } from '../../components/ui/Icons';
import { apiClient } from '../../services/api-client';

interface Props {
  onBackToLogin: () => void;
}

export const PasswordResetScreen: React.FC<Props> = ({ onBackToLogin }) => {
  const [mode, setMode] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);

  const handleResetRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!email || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid registered email address.' });
      return;
    }
    setIsLoading(true);
    try {
      const res: any = await apiClient.post('/auth/forgot-password', { email });
      if (res && res.configured) {
        setStatusMessage({
          type: 'success',
          text: `Your request has been processed. Password reset instructions have been dispatched to ${email}.`,
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: res.message || 'Your request has been processed. Follow the reset instructions sent to your registered address.',
        });
        if (res.resetToken) {
          setToken(res.resetToken);
          setMode('confirm');
        }
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Unable to process password reset request. Please contact your system administrator.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordConfirm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!token.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid password reset token.' });
      return;
    }
    if (newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsLoading(true);
    try {
      const res: any = await apiClient.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });
      setStatusMessage({
        type: 'success',
        text: res.message || 'Your password has been successfully updated. You may now sign in.',
      });
      setTimeout(() => {
        onBackToLogin();
      }, 2500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update password. Reset token may have expired or is invalid.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080C0A] bg-botanical-auth flex flex-col justify-center items-center p-4 sm:p-6 relative text-slate-100 selection:bg-mint-500 selection:text-forest-950">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-mint-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0E1712] rounded-3xl p-7 sm:p-9 border border-[#1C3127]/80 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest-950 border border-[#1C3127] text-mint-400 mb-1 shadow-md">
            <KeyIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'request'
              ? 'Enter your registered email to receive verification security instructions.'
              : 'Enter your verification token and specify your new password.'}
          </p>
        </div>

        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-mint-300'
                : statusMessage.type === 'info'
                ? 'bg-sky-950/80 border border-sky-500/40 text-sky-300'
                : 'bg-rose-950/80 border border-rose-900/60 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2Icon className="w-4 h-4 text-mint-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{statusMessage.text}</p>
            </div>
          </div>
        )}

        {mode === 'request' ? (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Registered Email Address
              </label>
              <input
                type="email"
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all mt-2"
            >
              <span>{isLoading ? 'Processing Request...' : 'Send Reset Instructions'}</span>
              <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordConfirm} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Reset Token
              </label>
              <input
                type="text"
                placeholder="Paste token from email"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                New Password (Min 8 characters)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all mt-2"
            >
              <span>{isLoading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#1C3127]/60 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs font-bold text-mint-400 hover:text-mint-300 hover:underline focus:outline-none"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </main>
  );
};
