import React, { useState } from 'react';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';
import { AppLayout } from '../../components/layout/AppLayout';
import { UsersIcon, CheckCircle2Icon, AlertTriangleIcon, ArrowRightIcon } from '../../components/ui/Icons';

interface Props {
  onBack: () => void;
}

export const HouseholdMembersScreen: React.FC<Props> = ({ onBack }) => {
  const { profile, updateProfile, isUpdating } = useCitizenProfile();
  const members = profile?.householdMembers || [];

  const [fullName, setFullName] = useState('');
  const [relation, setRelation] = useState('SPOUSE');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('FEMALE');
  const [income, setIncome] = useState('0');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!fullName || !age) {
      setStatusMessage({ type: 'error', text: 'Full Name and Age are required.' });
      return;
    }

    const newMember = {
      id: Math.random().toString(),
      fullName,
      relation,
      age: parseInt(age, 10),
      gender,
      annualIncomeINR: parseFloat(income) || 0,
    };

    const updatedMembers = [...members, newMember];

    try {
      await updateProfile({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        dateOfBirth: profile?.dateOfBirth || new Date().toISOString(),
        gender: profile?.gender || 'MALE',
        maritalStatus: profile?.maritalStatus || 'SINGLE',
        socialCategory: profile?.socialCategory || 'GENERAL',
        employmentStatus: profile?.employmentStatus || 'UNEMPLOYED',
        annualIncomeINR: profile?.annualIncomeINR || 0,
        disabilityType: profile?.disabilityType || 'NONE',
        disabilityPercent: profile?.disabilityPercent || 0,
        isBplCardHolder: profile?.isBplCardHolder || false,
        bplCardNumber: profile?.bplCardNumber,
        householdMembers: updatedMembers,
      });

      setFullName('');
      setAge('');
      setIncome('0');
      setStatusMessage({ type: 'success', text: `${fullName} added to household members.` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not save household member.' });
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
              Household Members
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Add family members to qualify for household welfare &amp; ration benefits.
            </p>
          </div>
        </div>

        {/* Member List Card */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-mint-400" />
            <h2 className="text-base font-bold text-white font-heading">
              Registered Family Members ({members.length})
            </h2>
          </div>

          {members.length > 0 ? (
            <div className="divide-y divide-[#1C3127]/60">
              {members.map((m) => (
                <div key={m.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">{m.fullName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {m.relation} • Age {m.age} • {m.gender}
                    </p>
                  </div>
                  <span className="text-xs font-black text-mint-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    ₹{m.annualIncomeINR.toLocaleString('en-IN')} / Yr
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No family members registered yet.</p>
          )}
        </div>

        {/* Add Member Form */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white font-heading">Add New Family Member</h2>

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

          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Relationship</label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3 py-3 bg-[#080C0A] border border-[#1C3127] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-mint-500"
                >
                  <option value="SPOUSE">Spouse</option>
                  <option value="SON">Son</option>
                  <option value="DAUGHTER">Daughter</option>
                  <option value="FATHER">Father</option>
                  <option value="MOTHER">Mother</option>
                  <option value="BROTHER">Brother</option>
                  <option value="SISTER">Sister</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Age</label>
                <input
                  type="number"
                  placeholder="24"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
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
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Income (₹ / Yr)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <span>+ Add Household Member</span>
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
