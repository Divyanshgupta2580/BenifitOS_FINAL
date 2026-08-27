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

      if (status === 409 || message.toLowerCase().includes('already exists')) {
        setEmailError('An account with this email address already exists.');
        setGeneralError('An account with this email address already exists. Please sign in instead.');
      } else if (status === 400 || message.toLowerCase().includes('validation') || message.toLowerCase().includes('valid email')) {
        if (message.toLowerCase().includes('email')) {
          setEmailError(message);
        }
        setGeneralError(message || 'Please check the highlighted fields and try again.');
      } else if (err.code === 'ERR_NETWORK' || message.includes('Network Error') || message.includes('connect')) {
        setGeneralError('Unable to connect to the BenefitOS backend server. Please verify http://localhost:4000 is reachable.');
      } else if (status >= 500) {
        setGeneralError('An unexpected server error occurred. Please try again later.');
      } else {
        setGeneralError(message || 'Could not register account. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 py-12 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 dark:bg-blue-700 text-white mb-3 shadow-sm">
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-1">Create Citizen Account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Provide your profile details to unlock personalized scheme benefits.</p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {generalError}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Ramesh Kumar Sharma"
            value={name}
            onChangeText={(val) => { setName(val); if (nameError) setNameError(null); }}
            error={nameError || undefined}
            required
            autoComplete="name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Age (Years)"
              type="number"
              placeholder="e.g. 28"
              value={age}
              onChangeText={(val) => { setAge(val); if (ageError) setAgeError(null); }}
              error={ageError || undefined}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-4 focus:border-blue-700 dark:focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-950/50"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="TRANSGENDER">Transgender</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Social Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-4 focus:border-blue-700 dark:focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-950/50"
              >
                <option value="GENERAL">General</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Profession / Status</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-4 focus:border-blue-700 dark:focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-950/50"
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

            <Input
              label="Household Annual Income (₹ / Year)"
              type="number"
              placeholder="e.g. 250000"
              value={annualIncome}
              onChangeText={(val) => { setAnnualIncome(val); if (incomeError) setIncomeError(null); }}
              error={incomeError || undefined}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">State / UT of Residence</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-4 focus:border-blue-700 dark:focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-950/50"
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

          <Input
            label="Email Address"
            type="email"
            placeholder="citizen@example.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (emailError) setEmailError(null);
            }}
            onBlur={handleEmailBlur}
            error={emailError || undefined}
            required
            autoComplete="email"
          />

          <Input
            label="Contact Number (Optional)"
            type="tel"
            placeholder="+91 9876543210"
            value={phone}
            onChangeText={setPhone}
            autoComplete="tel"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={(val) => { setPassword(val); if (passwordError) setPasswordError(null); }}
              error={passwordError || undefined}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(val) => { setConfirmPassword(val); if (confirmPasswordError) setConfirmPasswordError(null); }}
              error={confirmPasswordError || undefined}
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" title="Create Account & Discover Schemes" isLoading={isLoading} className="w-full py-3 mt-4" />
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-bold text-blue-900 dark:text-blue-400 hover:underline focus:outline-none ml-1"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};
