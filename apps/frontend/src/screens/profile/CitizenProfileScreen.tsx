import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onNavigateToDemographics: () => void;
  onNavigateToAddress: () => void;
  onNavigateToHousehold: () => void;
  onNavigateToLand: () => void;
  onBack?: () => void;
}

export const CitizenProfileScreen: React.FC<Props> = ({
  onNavigateToDemographics,
  onNavigateToAddress,
  onNavigateToHousehold,
  onNavigateToLand,
  onBack,
}) => {
  const { profile, isLoading, isError, refetch } = useCitizenProfile();

  if (isLoading) {
    return <LoadingSpinner message="Loading Citizen Profile..." />;
  }

  if (isError || !profile) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-xs">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Failed to Load Profile</h2>
          <p className="text-sm text-slate-600 mb-6">Unable to retrieve citizen details from server.</p>
          <Button title="Try Again" onClick={() => refetch()} className="w-full py-2.5" />
        </div>
      </main>
    );
  }

  const completionPct = profile.completionPercentage || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1"
              >
                ← Back
              </button>
            )}
            <h1 className="text-lg font-bold text-blue-900">Citizen Profile Management</h1>
          </div>
          <Badge label={`${completionPct}% COMPLETE`} variant="success" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Completion Header Banner */}
        <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">{profile.firstName} {profile.lastName}</h2>
            <p className="text-xs text-blue-100 mt-1 font-medium">
              {profile.gender} • Age {profile.age || 30} • Social Category: {profile.socialCategory}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-blue-950/60 border border-blue-700 px-4 py-2 rounded-xl">
            <span className="text-2xl font-black text-amber-400">{completionPct}%</span>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-blue-200 block font-semibold">Profile Score</span>
              <span className="text-xs text-emerald-400 font-bold">Verified</span>
            </div>
          </div>
        </div>

        {/* Section 1: Demographics */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              <h3 className="text-base font-bold text-blue-900">Demographics & Income</h3>
            </div>
            <button
              onClick={onNavigateToDemographics}
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              Edit Demographics →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">Employment Status</span>
              <span className="text-sm font-semibold text-slate-900 block mt-0.5">{profile.employmentStatus}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Annual Income</span>
              <span className="text-sm font-semibold text-slate-900 block mt-0.5">₹{profile.annualIncomeINR.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">BPL Card Holder</span>
              <div className="mt-1">
                <Badge
                  label={profile.isBplCardHolder ? 'YES' : 'NO'}
                  variant={profile.isBplCardHolder ? 'success' : 'warning'}
                />
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Disability Status</span>
              <span className="text-sm font-semibold text-slate-900 block mt-0.5">{profile.disabilityType}</span>
            </div>
          </div>
        </Card>

        {/* Section 2: Address */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏡</span>
              <h3 className="text-base font-bold text-blue-900">Residential Address</h3>
            </div>
            <button
              onClick={onNavigateToAddress}
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              Edit Address →
            </button>
          </div>

          {profile.address ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{profile.address.streetAddress}</p>
                <p className="text-xs text-slate-600">
                  {profile.address.city}, {profile.address.district}, {profile.address.state} - {profile.address.pincode}
                </p>
              </div>
              <Badge label={profile.address.isRural ? 'RURAL AREA' : 'URBAN AREA'} variant="primary" />
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No address details added yet.</p>
          )}
        </Card>

        {/* Section 3 & 4 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-blue-900">Household Members</h3>
              <button
                onClick={onNavigateToHousehold}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Manage ({profile.householdMembers?.length || 0})
              </button>
            </div>
            <p className="text-xs text-slate-600">
              {profile.householdMembers?.length || 0} family dependents registered for social safety net calculations.
            </p>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-blue-900">Land Holdings</h3>
              <button
                onClick={onNavigateToLand}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Manage ({profile.landDetails?.length || 0})
              </button>
            </div>
            <p className="text-xs text-slate-600">
              {profile.landDetails?.length || 0} agricultural land records linked for DBT farmer schemes.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};
