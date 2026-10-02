import React, { useState } from 'react';
import { apiClient } from '../../services/api-client';
import { useAuthStore } from '../../store/auth.store';
import { ArrowRightIcon } from '../../components/ui/Icons';

interface Props {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onNavigateToRegister, onNavigateToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setAuth } = useAuthStore();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }
    setIsLoading(true);
    try {
      const response: any = await apiClient.post('/auth/login', { email, password });
      await setAuth(response.user, response.tokens.accessToken, response.tokens.refreshToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080C0A] bg-botanical-auth flex flex-col justify-center items-center p-4 sm:p-6 relative text-slate-100 selection:bg-mint-500 selection:text-forest-950">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-mint-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0E1712] rounded-3xl p-7 sm:p-9 border border-[#1C3127]/80 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          {/* Mint Leaf Emblem */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-400 to-emerald-600 text-forest-950 shadow-lg shadow-mint-500/20 mb-1">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M17.72 4.28a1.5 1.5 0 0 0-1.5 0C13.2 6.04 10.4 8.7 8.5 12.1A17.9 17.9 0 0 0 6 20a1 1 0 0 0 1 1c7.28 0 13-5.72 13-13 0-1.3-.4-2.5-1.28-3.72ZM8.12 18.88c.6-2.5 1.76-4.8 3.38-6.76a16.8 16.8 0 0 1 4.5-3.62c.28 2.5-.4 5.2-1.9 7.38-1.5 2.18-3.7 3-5.98 3Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Benefit<span className="text-mint-400">OS</span>
          </h1>
          <p className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider">
            National Welfare Gateway
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your eligible government benefits and applications.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-900/80 text-xs font-semibold text-rose-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Email Address
            </label>
            <input
              type="email"
              placeholder="citizen@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-xs font-semibold text-mint-400 hover:text-mint-300 hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-lg shadow-mint-500/25 transition-all mt-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to Gateway'}</span>
            <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#1C3127]/60 text-center">
          <p className="text-xs text-slate-400">
            Don't have a citizen profile?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-bold text-mint-400 hover:text-mint-300 hover:underline focus:outline-none ml-1"
            >
              Register Now
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};
