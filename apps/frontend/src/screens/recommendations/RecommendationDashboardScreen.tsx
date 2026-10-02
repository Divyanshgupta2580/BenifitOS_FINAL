import React, { useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { useRecommendations } from '../../hooks/useRecommendations';
import { SchemeRecommendationItem } from '../../services/recommendation.service';
import {
  CheckCircle2Icon,
  AlertTriangleIcon,
  ArrowRightIcon,
  LandmarkIcon,
} from '../../components/ui/Icons';
import { AppLayout } from '../../components/layout/AppLayout';

interface Props {
  onSelectRecommendation: (id: string) => void;
  onCompareRecommendations: (ids: string[]) => void;
  onBack?: () => void;
}

export const RecommendationDashboardScreen: React.FC<Props> = ({
  onSelectRecommendation,
  onCompareRecommendations,
  onBack,
}) => {
  const { recommendations, isLoading, isError, refetch } = useRecommendations();
  const [filter, setFilter] = useState<'ELIGIBLE' | 'INCOMPLETE_PROFILE' | 'NEEDS_VERIFICATION' | 'NOT_ELIGIBLE' | 'ALL'>('ELIGIBLE');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const eligibleCount = recommendations.filter((r) => r.isEligible && (r.eligibilityStatus === 'ELIGIBLE' || !r.eligibilityStatus)).length;
  const incompleteCount = recommendations.filter(
    (r) =>
      !r.isEligible &&
      r.eligibilityStatus === 'INCOMPLETE_PROFILE'
  ).length;
  const needsVerificationCount = recommendations.filter(
    (r) =>
      !r.isEligible &&
      r.eligibilityStatus === 'NEEDS_VERIFICATION'
  ).length;
  const notEligibleCount = recommendations.filter(
    (r) =>
      !r.isEligible &&
      (r.eligibilityStatus === 'NOT_ELIGIBLE' || (!r.eligibilityStatus && !r.isEligible))
  ).length;

  const filteredRecs = recommendations.filter((r) => {
    if (filter === 'ELIGIBLE') return r.isEligible && (r.eligibilityStatus === 'ELIGIBLE' || !r.eligibilityStatus);
    if (filter === 'INCOMPLETE_PROFILE') {
      return !r.isEligible && r.eligibilityStatus === 'INCOMPLETE_PROFILE';
    }
    if (filter === 'NEEDS_VERIFICATION') {
      return !r.isEligible && r.eligibilityStatus === 'NEEDS_VERIFICATION';
    }
    if (filter === 'NOT_ELIGIBLE') {
      return !r.isEligible && (r.eligibilityStatus === 'NOT_ELIGIBLE' || (!r.eligibilityStatus && !r.isEligible));
    }
    return true;
  });

  const toggleSelectForCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  return (
    <AppLayout activeTab="schemes">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
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
                Scheme Recommendations &amp; Eligibility Engine
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic rule evaluation matched against your verified citizen profile.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-forest-950 border border-[#1C3127] text-mint-300">
            {recommendations.length} Schemes Analyzed
          </span>
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-4 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-bold text-white font-heading">
              Eligibility Status Filter
            </h2>
            <p className="text-[11px] text-slate-400">
              Select qualification criteria
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter('ELIGIBLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filter === 'ELIGIBLE'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-mint-300 shadow-xs'
                  : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
              }`}
            >
              Eligible ({eligibleCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('INCOMPLETE_PROFILE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filter === 'INCOMPLETE_PROFILE'
                  ? 'bg-amber-950/90 border-amber-500/50 text-amber-300 shadow-xs'
                  : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
              }`}
            >
              Incomplete ({incompleteCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('NEEDS_VERIFICATION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filter === 'NEEDS_VERIFICATION'
                  ? 'bg-sky-950/90 border-sky-500/50 text-sky-300 shadow-xs'
                  : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
              }`}
            >
              Needs Verification ({needsVerificationCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('NOT_ELIGIBLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filter === 'NOT_ELIGIBLE'
                  ? 'bg-rose-950/90 border-rose-900/60 text-rose-300 shadow-xs'
                  : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
              }`}
            >
              Not Eligible ({notEligibleCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filter === 'ALL'
                  ? 'bg-[#0B3B2B] border-mint-500/50 text-mint-300 shadow-xs'
                  : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
              }`}
            >
              All ({recommendations.length})
            </button>
          </div>
        </div>

        {/* Floating Compare Bar */}
        {selectedForCompare.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#0B3B2B] border border-mint-500/40 shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-xs text-white">
              <span className="font-bold">{selectedForCompare.length}</span> of 3 schemes selected for comparison
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedForCompare([])}
                className="px-3 py-1 rounded-xl bg-forest-950 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Clear
              </button>
              <button
                onClick={() => onCompareRecommendations(selectedForCompare)}
                disabled={selectedForCompare.length < 2}
                className="px-4 py-1.5 rounded-xl bg-mint-400 hover:bg-mint-300 disabled:opacity-50 text-forest-950 text-xs font-bold shadow-md"
              >
                Compare ({selectedForCompare.length}) →
              </button>
            </div>
          </div>
        )}

        {/* Recommendations List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height={180} className="rounded-2xl" />
            <Skeleton height={180} className="rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-[#160D10] border border-rose-900/60 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-300">Unable to load recommendations engine.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredRecs.length === 0 ? (
          <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-10 text-center flex flex-col items-center space-y-2">
            <LandmarkIcon className="w-8 h-8 text-slate-500" />
            <p className="text-sm font-bold text-white">No schemes in this category</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Change the filter above or update your citizen profile to see additional scheme matches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredRecs.map((rec: SchemeRecommendationItem) => {
              const scheme = rec.scheme || (rec as any);
              const isSelected = selectedForCompare.includes(rec.id);

              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecommendation(rec.id)}
                  className="group rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 hover:border-mint-500/40 p-5 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {scheme.code || 'GOV-SCHEME'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rec.isEligible
                            ? 'bg-emerald-950/80 border border-emerald-500/40 text-mint-300'
                            : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {rec.isEligible ? (
                          <CheckCircle2Icon className="w-3 h-3 text-mint-400" />
                        ) : (
                          <AlertTriangleIcon className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{rec.isEligible ? `${rec.matchPercentage}% Match` : 'Action Required'}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-mint-300 transition-colors font-heading leading-snug">
                        {scheme.title || rec.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {scheme.description || (rec as any).description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1C3127]/60 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={(e) => toggleSelectForCompare(rec.id, e)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#0B3B2B] border-mint-500 text-mint-300'
                          : 'bg-forest-950 border-[#1C3127] text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : '+ Compare'}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-mint-300">
                        ₹{rec.estimatedBenefit.toLocaleString('en-IN')} / Yr
                      </span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-mint-300 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
