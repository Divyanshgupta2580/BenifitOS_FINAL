import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/api-client';
import { useAuthStore } from '../../store/auth.store';

interface Props {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<Props> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setAuth } = useAuthStore();

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Email address and password are required.');
      return;
    }
    setIsLoading(true);
    try {
      const response: any = await apiClient.post('/auth/register', {
        email,
        password,
        phone: phone || undefined,
        role: 'CITIZEN',
      });
      await setAuth(response.user, response.tokens.accessToken, response.tokens.refreshToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not register account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-white text-xl font-bold mb-3 shadow-sm">
            📜
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Create Citizen Account</h1>
          <p className="text-sm text-slate-600">Register as a citizen to discover welfare scheme benefits.</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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
            label="Phone Number (Optional)"
            type="tel"
            placeholder="+91 9876543210"
            value={phone}
            onChangeText={setPhone}
            autoComplete="tel"
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            required
            autoComplete="new-password"
          />

          <Button type="submit" title="Create Account" isLoading={isLoading} className="w-full py-3 mt-2" />
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-bold text-blue-900 hover:underline focus:outline-none ml-1"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};
