import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { KeyIcon, CheckCircleIcon } from '../../components/ui/Icons';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
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
          text: res.message || 'Your request has been processed. If email delivery is configured, follow the reset instructions sent to your registered address.',
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 dark:bg-blue-700 text-white mb-3 shadow-sm">
            <KeyIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
            {mode === 'request' ? 'Reset Password' : 'Set New Password'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {mode === 'request'
              ? 'Enter your registered email address to request password reset instructions.'
              : 'Enter your reset token and new secure password.'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('request'); setStatusMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'request'
                ? 'bg-white dark:bg-slate-700 text-blue-950 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Request Reset Link
          </button>
          <button
            type="button"
            onClick={() => { setMode('confirm'); setStatusMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'confirm'
                ? 'bg-white dark:bg-slate-700 text-blue-950 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Enter Reset Token
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-lg border text-xs font-semibold leading-relaxed ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : statusMessage.type === 'info'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {mode === 'request' ? (
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

            <Button type="submit" title="Send Reset Instructions" isLoading={isLoading} className="w-full py-3" />
            <Button
              type="button"
              title="Back to Sign In"
              variant="outline"
              onClick={onBackToLogin}
              className="w-full py-2.5"
            />
          </form>
        ) : (
          <form onSubmit={handlePasswordConfirm} className="space-y-4">
            <Input
              label="Password Reset Token"
              type="text"
              placeholder="Enter 64-character token"
              value={token}
              onChangeText={setToken}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              required
            />

            <Button type="submit" title="Update Password" isLoading={isLoading} className="w-full py-3" />
            <Button
              type="button"
              title="Back to Sign In"
              variant="outline"
              onClick={onBackToLogin}
              className="w-full py-2.5"
            />
          </form>
        )}
      </div>
    </main>
  );
};
