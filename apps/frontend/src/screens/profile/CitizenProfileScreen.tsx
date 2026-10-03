import React from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { UserIcon, HomeIcon, UsersIcon, SproutIcon, CheckCircle2Icon, ArrowRightIcon } from '../../components/ui/Icons';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';
import { AppLayout } from '../../components/layout/AppLayout';
import { ErrorState } from '../../components/ui/ErrorState';

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
    return (
      <AppLayout activeTab="profile">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner message="Loading Citizen Profile..." />
        </div>
      </AppLayout>
    );
  }

  if (isError || !profile) {
    return (
      <AppLayout activeTab="profile">
        <main className="flex flex-col justify-center items-center min-h-[60vh] p-6 text-center">
          <div className="max-w-md w-full">
            <ErrorState
              title="Profile Unavailable"
              message="Unable to retrieve citizen details from the server. Please verify your connection."
              onRetry={() => refetch()}
              onSecondaryAction={onBack}
              secondaryActionLabel={onBack ? 'Back to Dashboard' : undefined}
            />
          </div>
        </main>
      </AppLayout>
    );
  }

  const completionPct = profile.completionPercentage || 75;

  return (
    <AppLayout activeTab="profile">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C3127]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-xs font-semibold text-mint-400 hover:underline mr-2"
                >
                  ← Back
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                Citizen Profile &amp; Verification
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Maintain your demographic profile for automated government scheme qualification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 text-mint-300">
              {completionPct}% Complete
            </span>
          </div>
        </div>

        {/* Completion Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-forest-950 via-[#0A1D15] to-forest-950 border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-mint-400 shadow-md">
              <UserIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-xs text-emerald-300/90 font-medium mt-1">
                {profile.gender} • Age {profile.age || 30} • Social Category: {profile.socialCategory}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#080C0A]/80 border border-[#1C3127] px-4 py-2.5 rounded-xl">
            <span className="text-2xl font-black text-mint-400 font-heading">{completionPct}%</span>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Profile Score
              </span>
              <span className="text-xs text-mint-300 font-bold flex items-center gap-1">
                <CheckCircle2Icon className="w-3.5 h-3.5 text-mint-400" />
                {completionPct === 100 ? 'Complete' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Demographics */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-5 h-5 text-mint-400" />
              <h3 className="text-base font-bold text-white font-heading">Demographics &amp; Income</h3>
            </div>
            <button
              onClick={onNavigateToDemographics}
              className="text-xs font-bold text-mint-400 hover:text-mint-300 inline-flex items-center gap-1"
            >
              <span>Edit Demographics</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#080C0A] p-4 rounded-xl border border-[#1C3127]">
            <div>
              <span className="text-[11px] text-slate-400 block">Employment Status</span>
              <span className="text-xs sm:text-sm font-semibold text-white block mt-0.5">{profile.employmentStatus}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Annual Income</span>
              <span className="text-xs sm:text-sm font-semibold text-mint-300 block mt-0.5">₹{profile.annualIncomeINR.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">BPL Card Holder</span>
              <span className="text-xs sm:text-sm font-semibold text-white block mt-0.5">
                {profile.isBplCardHolder ? 'YES' : 'NO'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Disability Status</span>
              <span className="text-xs sm:text-sm font-semibold text-white block mt-0.5">{profile.disabilityType}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Address */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <HomeIcon className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white font-heading">Residential Address</h3>
            </div>
            <button
              onClick={onNavigateToAddress}
              className="text-xs font-bold text-mint-400 hover:text-mint-300 inline-flex items-center gap-1"
            >
              <span>Edit Address</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {profile.address ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#080C0A] p-4 rounded-xl border border-[#1C3127]">
              <div>
                <span className="text-[11px] text-slate-400 block">State</span>
                <span className="text-xs sm:text-sm font-semibold text-white block mt-0.5">{profile.address.state}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">District</span>
                <span className="text-xs sm:text-sm font-semibold text-white block mt-0.5">{profile.address.district}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Area Type</span>
                <span className="text-xs sm:text-sm font-semibold text-white block mt-0.5">
                  {profile.address.isRural ? 'Rural' : 'Urban'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">PIN Code</span>
                <span className="text-xs sm:text-sm font-semibold text-white font-mono block mt-0.5">{profile.address.pincode}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No residential address registered yet.</p>
          )}
        </div>

        {/* Section 3: Household & Land Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Household Members */}
          <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-heading">Household Members</h3>
              </div>
              <button
                onClick={onNavigateToHousehold}
                className="text-xs font-bold text-mint-400 hover:text-mint-300"
              >
                Manage ({profile.householdMembers?.length || 0}) →
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {profile.householdMembers?.length || 0} registered family member(s) linked to your ration card.
            </p>
          </div>

          {/* Land Holding Details */}
          <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <SproutIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-heading">Agricultural Land</h3>
              </div>
              <button
                onClick={onNavigateToLand}
                className="text-xs font-bold text-mint-400 hover:text-mint-300"
              >
                Manage ({profile.landDetails?.length || 0}) →
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {profile.landDetails?.length || 0} registered agricultural parcel(s) for agricultural welfare schemes qualification.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
