import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SproutIcon } from '../../components/ui/Icons';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onBack: () => void;
}

export const LandDetailsScreen: React.FC<Props> = ({ onBack }) => {
  const { profile, updateProfile, isUpdating } = useCitizenProfile();
  const lands = profile?.landDetails || [];

  const [sizeAcres, setSizeAcres] = useState('');
  const [landType, setLandType] = useState('IRRIGATED');
  const [surveyNo, setSurveyNo] = useState('');
  const [district, setDistrict] = useState(profile?.address?.district || '');
  const [state, setState] = useState(profile?.address?.state || '');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddLand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!sizeAcres || !district || !state) {
      setStatusMessage({ type: 'error', text: 'Land size (Acres), District, and State are required.' });
      return;
    }

    const newLand = {
      id: Math.random().toString(),
      landSizeAcres: parseFloat(sizeAcres) || 0,
      landType,
      surveyNumber: surveyNo || undefined,
      district,
      state,
    };

    const updatedLands = [...lands, newLand];

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
        landDetails: updatedLands,
      });

      setSizeAcres('');
      setSurveyNo('');
      setStatusMessage({ type: 'success', text: 'Agricultural land record registered successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not save land record.' });
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
            <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400">Manage Land Holdings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Land Records List */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 dark:text-blue-400 mb-3">Registered Land Records</h2>
          {lands.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {lands.map((l) => (
                <div key={l.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {l.landSizeAcres} Acres ({l.landType})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Survey / Khasra No: {l.surveyNumber || 'N/A'} • {l.district}, {l.state}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <SproutIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Farmer Record</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No agricultural land records added yet.</p>
          )}
        </Card>

        {/* Add Land Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-blue-900 dark:text-blue-400 mb-4">Add Agricultural Land Holding</h2>

          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-lg border text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleAddLand} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Land Size (Acres)" type="number" step="0.01" value={sizeAcres} onChangeText={setSizeAcres} placeholder="e.g. 2.5" required />
              
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Land Type</label>
                <select
                  value={landType}
                  onChange={(e) => setLandType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 focus:border-blue-700 dark:focus:border-blue-500"
                >
                  <option value="IRRIGATED">IRRIGATED</option>
                  <option value="UNIRRIGATED">UNIRRIGATED</option>
                  <option value="BARREN">BARREN</option>
                  <option value="ORCHARD">ORCHARD</option>
                </select>
              </div>
            </div>

            <Input label="Survey / Khasra Number" value={surveyNo} onChangeText={setSurveyNo} placeholder="e.g. 142/A" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="District" value={district} onChangeText={setDistrict} required />
              <Input label="State" value={state} onChangeText={setState} required />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" title="Add Land Record" isLoading={isUpdating} className="flex-1 py-2.5" />
              <Button type="button" title="Back" variant="outline" onClick={onBack} className="px-6" />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
