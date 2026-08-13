import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { BuildingIcon } from '../../components/ui/Icons';
import { apiClient } from '../../services/api-client';
import { useAuthStore } from '../../store/auth.store';

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
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-white mb-3 shadow-sm">
            <BuildingIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Welcome to BenefitOS</h1>
          <p className="text-sm text-slate-600">Sign in to manage your welfare scheme applications.</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="citizen@example.com"
            value={email}
            onChangeText={setEmail}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNavigateToForgotPassword}
              className="text-xs font-semibold text-blue-900 hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>

          <Button type="submit" title="Sign In" isLoading={isLoading} className="w-full py-3 mt-2" />
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-bold text-blue-900 hover:underline focus:outline-none ml-1"
            >
              Register Citizen Profile
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};
