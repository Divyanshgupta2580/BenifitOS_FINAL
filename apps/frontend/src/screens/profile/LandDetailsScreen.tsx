import React, { useState } from 'react';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';
import { AppLayout } from '../../components/layout/AppLayout';
import { SproutIcon, CheckCircle2Icon, AlertTriangleIcon, ArrowRightIcon } from '../../components/ui/Icons';

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
              Manage Agricultural Land Holdings
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Land ownership records for agricultural and agrarian welfare subsidy schemes.
            </p>
          </div>
        </div>

        {/* Land Records List Card */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <SproutIcon className="w-5 h-5 text-mint-400" />
            <h2 className="text-base font-bold text-white font-heading">
              Registered Land Records ({lands.length})
            </h2>
          </div>

          {lands.length > 0 ? (
            <div className="divide-y divide-[#1C3127]/60">
              {lands.map((l) => (
                <div key={l.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {l.landSizeAcres} Acres ({l.landType})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Survey / Khasra No: {l.surveyNumber || 'N/A'} • {l.district}, {l.state}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-300 bg-forest-950 px-2.5 py-1 rounded-lg border border-[#1C3127]">
                    Self-Reported
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No land parcels registered yet.</p>
          )}
        </div>

        {/* Add Land Form */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white font-heading">Add Land Parcel Record</h2>

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

          <form onSubmit={handleAddLand} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Land Size (Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2.5"
                  value={sizeAcres}
                  onChange={(e) => setSizeAcres(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Land Irrigation Type</label>
                <select
                  value={landType}
                  onChange={(e) => setLandType(e.target.value)}
                  className="w-full px-3 py-3 bg-[#080C0A] border border-[#1C3127] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-mint-500"
                >
                  <option value="IRRIGATED">Irrigated (सिंचित)</option>
                  <option value="UNIRRIGATED">Unirrigated (असिंचित)</option>
                  <option value="BARREN">Barren / Waste (बंजर)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Survey / Khasra Number</label>
              <input
                type="text"
                placeholder="e.g. 142/A"
                value={surveyNo}
                onChange={(e) => setSurveyNo(e.target.value)}
                className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <span>+ Register Land Parcel</span>
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
