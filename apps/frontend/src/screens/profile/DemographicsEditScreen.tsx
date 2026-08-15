import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onBack: () => void;
}

export const DemographicsEditScreen: React.FC<Props> = ({ onBack }) => {
  const { profile, updateProfile, isUpdating } = useCitizenProfile();

  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [dob, setDob] = useState(profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '1995-01-01');
  const [gender, setGender] = useState(profile?.gender || 'MALE');
  const [maritalStatus, setMaritalStatus] = useState(profile?.maritalStatus || 'SINGLE');
  const [socialCategory, setSocialCategory] = useState(profile?.socialCategory || 'GENERAL');
  const [employmentStatus, setEmploymentStatus] = useState(profile?.employmentStatus || 'UNEMPLOYED');
  const [income, setIncome] = useState(profile?.annualIncomeINR ? String(profile.annualIncomeINR) : '150000');
  const [disabilityType, setDisabilityType] = useState(profile?.disabilityType || 'NONE');
  const [disabilityPercent, setDisabilityPercent] = useState(profile?.disabilityPercent ? String(profile.disabilityPercent) : '0');
  const [isBpl, setIsBpl] = useState(profile?.isBplCardHolder || false);
  const [bplCardNumber, setBplCardNumber] = useState(profile?.bplCardNumber || '');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!firstName || !lastName) {
      setStatusMessage({ type: 'error', text: 'First Name and Last Name are required.' });
      return;
    }
    try {
      await updateProfile({
        firstName,
        lastName,
        dateOfBirth: new Date(dob).toISOString(),
        gender,
        maritalStatus,
        socialCategory,
        employmentStatus,
        annualIncomeINR: parseFloat(income) || 0,
        disabilityType,
        disabilityPercent: parseFloat(disabilityPercent) || 0,
        isBplCardHolder: isBpl,
        bplCardNumber: isBpl ? bplCardNumber : undefined,
      });
      setStatusMessage({ type: 'success', text: 'Profile demographics updated successfully!' });
      setTimeout(onBack, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not save profile changes.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
            ← Back to Profile
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400">Edit Demographics & Income</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          {statusMessage && (
            <div
              className={`mb-6 p-3.5 rounded-xl border text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" value={firstName} onChangeText={setFirstName} required />
              <Input label="Last Name" value={lastName} onChangeText={setLastName} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Date of Birth" type="date" value={dob} onChangeText={setDob} required />
              
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 focus:border-blue-700 dark:focus:border-blue-500"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="TRANSGENDER">TRANSGENDER</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Marital Status</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 focus:border-blue-700 dark:focus:border-blue-500"
                >
                  <option value="SINGLE">SINGLE</option>
                  <option value="MARRIED">MARRIED</option>
                  <option value="DIVORCED">DIVORCED</option>
                  <option value="WIDOWED">WIDOWED</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Social Category</label>
                <select
                  value={socialCategory}
                  onChange={(e) => setSocialCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 focus:border-blue-700 dark:focus:border-blue-500"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Employment Status</label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 focus:border-blue-700 dark:focus:border-blue-500"
                >
                  <option value="EMPLOYED">EMPLOYED</option>
                  <option value="UNEMPLOYED">UNEMPLOYED</option>
                  <option value="SELF_EMPLOYED">SELF_EMPLOYED</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="RETIRED">RETIRED</option>
                  <option value="FARMER">FARMER</option>
                  <option value="DAILY_WAGE">DAILY_WAGE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Annual Income (INR)" type="number" value={income} onChangeText={setIncome} required />
              
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Disability Type</label>
                <select
                  value={disabilityType}
                  onChange={(e) => setDisabilityType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 focus:border-blue-700 dark:focus:border-blue-500"
                >
                  <option value="NONE">NONE</option>
                  <option value="VISUAL">VISUAL</option>
                  <option value="HEARING">HEARING</option>
                  <option value="LOCOMOTOR">LOCOMOTOR</option>
                  <option value="INTELLECTUAL">INTELLECTUAL</option>
                  <option value="MULTIPLE">MULTIPLE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <Input label="Disability (%)" type="number" value={disabilityPercent} onChangeText={setDisabilityPercent} />
            </div>

            {/* BPL Toggle Checkbox */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <label htmlFor="bpl-toggle" className="text-xs font-bold text-slate-900 dark:text-slate-100 block cursor-pointer">
                  Below Poverty Line (BPL) Card Holder?
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Enable if holding valid state/central BPL ration card.</span>
              </div>
              <input
                id="bpl-toggle"
                type="checkbox"
                checked={isBpl}
                onChange={(e) => setIsBpl(e.target.checked)}
                className="w-5 h-5 text-blue-900 dark:text-blue-500 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {isBpl && <Input label="BPL Card Number" value={bplCardNumber} onChangeText={setBplCardNumber} />}

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="submit" title="Save Demographics" isLoading={isUpdating} className="flex-1 py-3" />
              <Button type="button" title="Cancel" variant="outline" onClick={onBack} className="px-6" />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
