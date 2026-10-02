import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DocumentTextIcon } from '../../components/ui/Icons';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { apiClient } from '../../services/api-client';
import { useAuthStore } from '../../store/auth.store';

interface Props {
  onNavigateToLogin: () => void;
}

// Standards-compliant email validation matching RFC 5322 and class-validator specs
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
};

export const RegisterScreen: React.FC<Props> = ({ onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState('MALE');
  const [category, setCategory] = useState('GENERAL');
  const [profession, setProfession] = useState('EMPLOYED');
  const [annualIncome, setAnnualIncome] = useState<string>('');
  const [state, setState] = useState('Uttar Pradesh');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field-level error states
  const [nameError, setNameError] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [incomeError, setIncomeError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleEmailBlur = () => {
    if (!email) {
      setEmailError('Email address is required.');
    } else if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address (e.g. name@example.com).');
    } else {
      setEmailError(null);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGeneralError(null);
    setNameError(null);
    setAgeError(null);
    setIncomeError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    let hasValidationError = false;

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setNameError('Full name must be at least 2 characters long.');
      hasValidationError = true;
    }

    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 18 || numAge > 120) {
      setAgeError('Enter a valid age between 18 and 120.');
      hasValidationError = true;
    }

    const numIncome = parseFloat(annualIncome);
    if (isNaN(numIncome) || numIncome < 0) {
      setIncomeError('Enter a valid non-negative household annual income in Rupees (₹).');
      hasValidationError = true;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setEmailError('Email address is required.');
      hasValidationError = true;
    } else if (!isValidEmail(normalizedEmail)) {
      setEmailError('Enter a valid email address (e.g. name@example.com).');
      hasValidationError = true;
    }

    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      hasValidationError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match. Please re-enter.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await apiClient.post('/auth/register', {
        name: trimmedName,
        age: numAge,
        gender,
        category,
        profession,
        annualIncome: numIncome,
        state,
        email: normalizedEmail,
        phone: phone.trim() ? phone.trim() : undefined,
        password,
      });
      await setAuth(response.user, response.tokens.accessToken, response.tokens.refreshToken);
    } catch (err: any) {
      const status = err.status || err.response?.status;
      const message = err.message || '';
      const responseData = err.response?.data;
      const backendMessage = responseData?.error?.message || responseData?.message || message;

      if (status === 409 || backendMessage.toLowerCase().includes('already exists')) {
        setEmailError('An account with this email address already exists.');
        setGeneralError('An account with this email address already exists. Please sign in instead.');
      } else if (status === 400 || backendMessage.toLowerCase().includes('validation') || backendMessage.toLowerCase().includes('valid email')) {
        if (backendMessage.toLowerCase().includes('email')) {
          setEmailError(backendMessage);
        }
        setGeneralError(backendMessage || 'Please check the highlighted fields and try again.');
      } else if (err.code === 'ERR_NETWORK' || message.includes('Network Error')) {
        setGeneralError('Unable to connect to the BenefitOS backend service. Please verify your network connection or try again.');
      } else if (status >= 500) {
        setGeneralError('An unexpected server error occurred. Please try again later.');
      } else {
        setGeneralError(backendMessage || 'Could not register account. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080C0A] bg-botanical-auth flex flex-col justify-center items-center p-4 sm:p-6 py-12 relative text-slate-100 selection:bg-mint-500 selection:text-forest-950">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-mint-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-[#0E1712] rounded-3xl p-7 sm:p-9 border border-[#1C3127]/80 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-400 to-emerald-600 text-forest-950 shadow-lg shadow-mint-500/20 mb-1">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M17.72 4.28a1.5 1.5 0 0 0-1.5 0C13.2 6.04 10.4 8.7 8.5 12.1A17.9 17.9 0 0 0 6 20a1 1 0 0 0 1 1c7.28 0 13-5.72 13-13 0-1.3-.4-2.5-1.28-3.72ZM8.12 18.88c.6-2.5 1.76-4.8 3.38-6.76a16.8 16.8 0 0 1 4.5-3.62c.28 2.5-.4 5.2-1.9 7.38-1.5 2.18-3.7 3-5.98 3Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Create Citizen Account
          </h1>
          <p className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider">
            National Welfare Gateway
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Provide your profile details to unlock automatic scheme qualifications.
          </p>
        </div>

        {generalError && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-900/80 text-xs font-semibold text-rose-300">
            {generalError}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              required
              className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
            />
            {nameError && <p className="text-[11px] text-rose-400">{nameError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Age (Years)
              </label>
              <input
                type="number"
                placeholder="28"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (ageError) setAgeError(null);
                }}
                required
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
              />
              {ageError && <p className="text-[11px] text-rose-400">{ageError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-3 bg-[#080C0A] border border-[#1C3127] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-mint-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="TRANSGENDER">Transgender</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-3 bg-[#080C0A] border border-[#1C3127] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-mint-500"
              >
                <option value="GENERAL">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Profession / Status
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-3 bg-[#080C0A] border border-[#1C3127] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-mint-500"
              >
                <option value="EMPLOYED">Salaried / Employed</option>
                <option value="SELF_EMPLOYED">Self Employed / Business</option>
                <option value="FARMER">Farmer / Agriculture</option>
                <option value="DAILY_WAGE">Daily Wage Laborer</option>
                <option value="STUDENT">Student</option>
                <option value="UNEMPLOYED">Unemployed</option>
                <option value="RETIRED">Retired / Senior Citizen</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Annual Income (₹ / Yr)
              </label>
              <input
                type="number"
                placeholder="250000"
                value={annualIncome}
                onChange={(e) => {
                  setAnnualIncome(e.target.value);
                  if (incomeError) setIncomeError(null);
                }}
                required
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
              />
              {incomeError && <p className="text-[11px] text-rose-400">{incomeError}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              State / UT of Residence
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-3 bg-[#080C0A] border border-[#1C3127] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-mint-500"
            >
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Bihar">Bihar</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Kerala">Kerala</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Odisha">Odisha</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Assam">Assam</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Goa">Goa</option>
              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
              <option value="National">Other / Central Union Territory</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Email Address
            </label>
            <input
              type="email"
              placeholder="citizen@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              onBlur={handleEmailBlur}
              required
              className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
            />
            {emailError && <p className="text-[11px] text-rose-400">{emailError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                required
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
              />
              {passwordError && <p className="text-[11px] text-rose-400">{passwordError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                required
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
              />
              {confirmPasswordError && (
                <p className="text-[11px] text-rose-400">{confirmPasswordError}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-lg shadow-mint-500/25 transition-all mt-4"
          >
            <span>{isLoading ? 'Creating Account...' : 'Create Account & Discover Schemes'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#1C3127]/60 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-bold text-mint-400 hover:text-mint-300 hover:underline focus:outline-none ml-1"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};
