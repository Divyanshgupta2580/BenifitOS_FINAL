import React, { useState } from 'react';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';
import { AppLayout } from '../../components/layout/AppLayout';
import { CheckCircle2Icon, AlertTriangleIcon, ArrowRightIcon } from '../../components/ui/Icons';

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
    <AppLayout activeTab="profile">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-4">
          <div>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-mint-400 hover:underline mb-1 block"
            >
              ← Back to Profile
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Edit Demographics &amp; Income
            </h1>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl space-y-5">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-mint-300'
                  : 'bg-rose-950/80 border border-rose-900/60 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2Icon className="w-4 h-4 text-mint-400 shrink-0" />
              ) : (
                <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Gender</label>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Social Category</label>
                <select
                  value={socialCategory}
                  onChange={(e) => setSocialCategory(e.target.value)}
                  className="w-full px-3 py-3 bg-[#080C0A] border border-[#1C3127] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-mint-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Employment Status</label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  className="w-full px-3 py-3 bg-[#080C0A] border border-[#1C3127] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-mint-500"
                >
                  <option value="EMPLOYED">Salaried / Employed</option>
                  <option value="SELF_EMPLOYED">Self Employed</option>
                  <option value="FARMER">Farmer</option>
                  <option value="DAILY_WAGE">Daily Wage Laborer</option>
                  <option value="STUDENT">Student</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Household Annual Income (₹ / Year)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <span>{isUpdating ? 'Saving Profile...' : 'Save Demographics'}</span>
                <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
