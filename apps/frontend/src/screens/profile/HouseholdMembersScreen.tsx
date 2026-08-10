import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
            ← Back to Profile
          </button>
          <h1 className="text-lg font-bold text-blue-900">Manage Household Members</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Member List */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 mb-3">Registered Family Members</h2>
          {members.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {members.map((m) => (
                <div key={m.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{m.fullName}</h3>
                    <p className="text-xs text-slate-500">
                      {m.relation} • Age {m.age} • {m.gender}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    ₹{m.annualIncomeINR.toLocaleString('en-IN')} / Yr
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No family dependents added yet.</p>
          )}
        </Card>

        {/* Add Member Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-blue-900 mb-4">Add Dependent Member</h2>

          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-lg border text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleAddMember} className="space-y-4">
            <Input label="Full Name" value={fullName} onChangeText={setFullName} placeholder="e.g. Sunita Devi" required />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Relation</label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-700"
                >
                  <option value="SPOUSE">SPOUSE</option>
                  <option value="CHILD">CHILD</option>
                  <option value="PARENT">PARENT</option>
                  <option value="SIBLING">SIBLING</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <Input label="Age" type="number" value={age} onChangeText={setAge} required />

              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-700"
                >
                  <option value="FEMALE">FEMALE</option>
                  <option value="MALE">MALE</option>
                  <option value="TRANSGENDER">TRANSGENDER</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            <Input label="Annual Income (INR)" type="number" value={income} onChangeText={setIncome} />

            <div className="flex gap-3 pt-2">
              <Button type="submit" title="Add Household Member" isLoading={isUpdating} className="flex-1 py-2.5" />
              <Button type="button" title="Back" variant="outline" onClick={onBack} className="px-6" />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
