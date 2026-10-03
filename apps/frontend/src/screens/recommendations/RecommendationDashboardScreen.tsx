import React, { useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { useRecommendations } from '../../hooks/useRecommendations';
import { SchemeRecommendationItem } from '../../services/recommendation.service';
import {
  CheckCircle2Icon,
  AlertTriangleIcon,
  ArrowRightIcon,
  LandmarkIcon,
  ClockIcon,
  BuildingIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../../components/ui/Icons';
import { AppLayout } from '../../components/layout/AppLayout';
import { ErrorState } from '../../components/ui/ErrorState';

interface Props {
  onSelectRecommendation: (id: string) => void;
  onCompareRecommendations: (ids: string[]) => void;
  onBack?: () => void;
  onNavigateToCatalog?: () => void;
}

export const RecommendationDashboardScreen: React.FC<Props> = ({
  onSelectRecommendation,
  onCompareRecommendations,
  onBack,
  onNavigateToCatalog,
}) => {
  const { recommendations, isLoading, isError, refetch } = useRecommendations();
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'ELIGIBLE' | 'IN_1_YEAR' | 'IN_2_YEARS' | 'IN_3_YEARS' | 'NEEDS_VERIFICATION' | 'INCOMPLETE_PROFILE' | 'NOT_ELIGIBLE'
  >('ALL');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showIneligibleSection, setShowIneligibleSection] = useState<boolean>(false);

  // Categorize recommendations deterministically
  const eligibleNowList = recommendations.filter(
    (r) => r.isEligible === true && r.eligibilityStatus === 'ELIGIBLE'
  );

  const in1YearList = recommendations.filter(
    (r) => !r.isEligible && r.eligibilityStatus === 'FUTURE_ELIGIBLE' && (r.yearsUntilEligible === 1 || r.eligibilityTiming === 'IN_1_YEAR')
  );

  const in2YearsList = recommendations.filter(
    (r) => !r.isEligible && r.eligibilityStatus === 'FUTURE_ELIGIBLE' && (r.yearsUntilEligible === 2 || r.eligibilityTiming === 'IN_2_YEARS')
  );

  const in3YearsList = recommendations.filter(
    (r) => !r.isEligible && r.eligibilityStatus === 'FUTURE_ELIGIBLE' && (r.yearsUntilEligible === 3 || r.eligibilityTiming === 'IN_3_YEARS')
  );

  const needsVerificationList = recommendations.filter(
    (r) => !r.isEligible && r.eligibilityStatus === 'NEEDS_VERIFICATION'
  );

  const incompleteList = recommendations.filter(
    (r) => !r.isEligible && r.eligibilityStatus === 'INCOMPLETE_PROFILE'
  );

  const notEligibleList = recommendations.filter(
    (r) =>
      !r.isEligible &&
      r.eligibilityStatus !== 'FUTURE_ELIGIBLE' &&
      r.eligibilityStatus !== 'INCOMPLETE_PROFILE' &&
      r.eligibilityStatus !== 'NEEDS_VERIFICATION'
  );

  const totalFutureCount = in1YearList.length + in2YearsList.length + in3YearsList.length;

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

  const renderSchemeCard = (rec: SchemeRecommendationItem) => {
    const scheme = rec.scheme || (rec as any);
    const schemeId = scheme?.id || rec.schemeId || rec.id;
    const isSelected = selectedForCompare.includes(rec.id);
    const title = scheme?.title || rec.title || 'Welfare Scheme';
    const code = scheme?.code || rec.code || 'GOV-SCHEME';
    const department = scheme?.department || rec.department || 'Government of India';
    const description = scheme?.description || (rec as any).description || '';
    const benefit = rec.estimatedBenefit || scheme?.financialBenefit || 0;
    const category = scheme?.category || rec.category || 'WELFARE';

    return (
      <div
        key={rec.id}
        onClick={() => onSelectRecommendation(schemeId)}
        className="group rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 hover:border-mint-500/40 p-5 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectRecommendation(schemeId);
          }
        }}
      >
        <div className="space-y-3">
          {/* Top Bar: Code, Category, and Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400">
                {code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-900 border border-[#1C3127] text-slate-300">
                {category.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Status & Timing Badge */}
            {rec.isEligible === true && rec.eligibilityStatus === 'ELIGIBLE' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-950/90 border border-emerald-500/50 text-mint-300 shadow-xs">
                <CheckCircle2Icon className="w-3.5 h-3.5 text-mint-400 shrink-0" />
                <span>Eligible Now</span>
              </span>
            ) : rec.eligibilityStatus === 'FUTURE_ELIGIBLE' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-950/90 border border-sky-500/50 text-sky-300 shadow-xs">
                <ClockIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Eligible in {rec.yearsUntilEligible || 1} Yr{(rec.yearsUntilEligible || 1) > 1 ? 's' : ''}</span>
              </span>
            ) : rec.eligibilityStatus === 'NEEDS_VERIFICATION' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-950/90 border border-indigo-500/50 text-indigo-300 shadow-xs">
                <AlertTriangleIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Verification Required</span>
              </span>
            ) : rec.eligibilityStatus === 'INCOMPLETE_PROFILE' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-950/90 border border-amber-500/50 text-amber-300 shadow-xs">
                <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Complete Profile</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-950/90 border border-rose-900/60 text-rose-300 shadow-xs">
                <span>Not Eligible</span>
              </span>
            )}
          </div>

          {/* Scheme Title & Ministry */}
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-mint-300 transition-colors font-heading leading-snug">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
              <BuildingIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{department}</span>
            </div>
            {description && (
              <p className="text-xs text-slate-300/90 mt-2 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Verified Reason Box */}
          {rec.statusReason && (
            <div className="bg-[#080C0A] rounded-xl p-3 border border-[#1C3127] space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Evaluation Result
              </p>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {rec.statusReason}
              </p>
            </div>
          )}

          {/* Criteria Satisfied Checklist Snippet */}
          {rec.criteriaMet && rec.criteriaMet.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Satisfied Conditions ({rec.criteriaMet.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {rec.criteriaMet.slice(0, 2).map((crit, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-forest-950/80 border border-[#1C3127] text-[11px] text-slate-300"
                  >
                    <CheckCircle2Icon className="w-3 h-3 text-mint-400 shrink-0" />
                    <span className="truncate max-w-[200px]">{crit}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Benefit Amount & Compare / Details Actions */}
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

          <div className="flex items-center gap-3">
            {benefit > 0 && (
              <span className="font-bold text-mint-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-xs">
                ₹{benefit.toLocaleString('en-IN')} / Yr
              </span>
            )}
            <div className="inline-flex items-center gap-1 font-bold text-mint-400 group-hover:text-mint-300 transition-colors">
              <span>View Details</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    );
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
                Scheme Recommendations &amp; Eligibility Results
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic rule evaluation matched against your citizen profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-forest-950 border border-[#1C3127] text-mint-300">
              {recommendations.length} Schemes Analyzed
            </span>
          </div>
        </div>

        {/* Filter / View Mode Navigation Bar */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-4 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Eligibility &amp; Qualification Groups
              </h2>
              <p className="text-[11px] text-slate-400">
                Browse schemes by qualification timing and status
              </p>
            </div>

            {totalFutureCount > 0 && (
              <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" />
                <span>{totalFutureCount} Future scheme{totalFutureCount > 1 ? 's' : ''} in 1–3 years</span>
              </span>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'ALL'
                  ? 'bg-[#0B3B2B] border-mint-500/50 text-mint-300 shadow-xs'
                  : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
              }`}
            >
              All Groups ({recommendations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ELIGIBLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'ELIGIBLE'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-mint-300 shadow-xs'
                  : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
              }`}
            >
              Eligible Now ({eligibleNowList.length})
            </button>
            {in1YearList.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('IN_1_YEAR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === 'IN_1_YEAR'
                    ? 'bg-sky-950/90 border-sky-500/50 text-sky-300 shadow-xs'
                    : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
                }`}
              >
                In 1 Year ({in1YearList.length})
              </button>
            )}
            {in2YearsList.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('IN_2_YEARS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === 'IN_2_YEARS'
                    ? 'bg-sky-950/90 border-sky-500/50 text-sky-300 shadow-xs'
                    : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
                }`}
              >
                In 2 Years ({in2YearsList.length})
              </button>
            )}
            {in3YearsList.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('IN_3_YEARS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === 'IN_3_YEARS'
                    ? 'bg-sky-950/90 border-sky-500/50 text-sky-300 shadow-xs'
                    : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
                }`}
              >
                In 3 Years ({in3YearsList.length})
              </button>
            )}
            {needsVerificationList.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('NEEDS_VERIFICATION')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === 'NEEDS_VERIFICATION'
                    ? 'bg-indigo-950/90 border-indigo-500/50 text-indigo-300 shadow-xs'
                    : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
                }`}
              >
                Needs Verification ({needsVerificationList.length})
              </button>
            )}
            {incompleteList.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('INCOMPLETE_PROFILE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === 'INCOMPLETE_PROFILE'
                    ? 'bg-amber-950/90 border-amber-500/50 text-amber-300 shadow-xs'
                    : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
                }`}
              >
                Incomplete Profile ({incompleteList.length})
              </button>
            )}
            {notEligibleList.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('NOT_ELIGIBLE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === 'NOT_ELIGIBLE'
                    ? 'bg-rose-950/90 border-rose-900/60 text-rose-300 shadow-xs'
                    : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
                }`}
              >
                Not Eligible ({notEligibleList.length})
              </button>
            )}
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

        {/* Main Content Area */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton height={28} width={200} className="rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton height={180} className="rounded-2xl" />
                <Skeleton height={180} className="rounded-2xl" />
              </div>
            </div>
          </div>
        ) : isError ? (
          <ErrorState
            title="Unable to Load Recommendations"
            message="We encountered a connection issue while communicating with the recommendation engine. Your data is safe."
            onRetry={() => refetch()}
            onSecondaryAction={onBack}
            secondaryActionLabel={onBack ? 'Back to Dashboard' : undefined}
          />
        ) : activeTab === 'ALL' ? (
          /* ALL GROUPS VIEW (Structured Sections) */
          <div className="space-y-8">
            {/* 1. ELIGIBLE NOW SECTION */}
            <section className="space-y-3" aria-labelledby="section-eligible-now">
              <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-2">
                <div>
                  <h2
                    id="section-eligible-now"
                    className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2"
                  >
                    <span>Eligible Now</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/90 border border-emerald-500/50 text-mint-300">
                      {eligibleNowList.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    You currently qualify for these welfare schemes based on satisfying all mandatory eligibility rules.
                  </p>
                </div>
              </div>

              {eligibleNowList.length === 0 ? (
                <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-8 text-center flex flex-col items-center space-y-3 shadow-lg">
                  <LandmarkIcon className="w-8 h-8 text-slate-500" />
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-sm font-bold text-white font-heading">
                      No schemes confirmed eligible yet.
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Based on the deterministic evaluation of your current profile, no schemes currently meet 100% of mandatory conditions. Update your profile or explore the full government welfare catalog.
                    </p>
                  </div>
                  {onNavigateToCatalog && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onNavigateToCatalog}
                        className="px-4 py-2 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 text-xs font-bold transition-all shadow-md"
                      >
                        Explore All Schemes →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {eligibleNowList.map(renderSchemeCard)}
                </div>
              )}
            </section>

            {/* 2. ELIGIBLE IN 1 YEAR SECTION */}
            {in1YearList.length > 0 && (
              <section className="space-y-3" aria-labelledby="section-in-1-year">
                <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-2">
                  <div>
                    <h2
                      id="section-in-1-year"
                      className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2"
                    >
                      <span>Eligible in 1 Year</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-950/90 border border-sky-500/50 text-sky-300">
                        {in1YearList.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      You will become eligible for these schemes when the age threshold is reached in 1 year.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {in1YearList.map(renderSchemeCard)}
                </div>
              </section>
            )}

            {/* 3. ELIGIBLE IN 2 YEARS SECTION */}
            {in2YearsList.length > 0 && (
              <section className="space-y-3" aria-labelledby="section-in-2-years">
                <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-2">
                  <div>
                    <h2
                      id="section-in-2-years"
                      className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2"
                    >
                      <span>Eligible in 2 Years</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-950/90 border border-sky-500/50 text-sky-300">
                        {in2YearsList.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      You will become eligible for these schemes when the age threshold is reached in 2 years.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {in2YearsList.map(renderSchemeCard)}
                </div>
              </section>
            )}

            {/* 4. ELIGIBLE IN 3 YEARS SECTION */}
            {in3YearsList.length > 0 && (
              <section className="space-y-3" aria-labelledby="section-in-3-years">
                <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-2">
                  <div>
                    <h2
                      id="section-in-3-years"
                      className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2"
                    >
                      <span>Eligible in 3 Years</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-950/90 border border-sky-500/50 text-sky-300">
                        {in3YearsList.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      You will become eligible for these schemes when the age threshold is reached in 3 years.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {in3YearsList.map(renderSchemeCard)}
                </div>
              </section>
            )}

            {/* 5. VERIFICATION REQUIRED SECTION */}
            {needsVerificationList.length > 0 && (
              <section className="space-y-3" aria-labelledby="section-verification-required">
                <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-2">
                  <div>
                    <h2
                      id="section-verification-required"
                      className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2"
                    >
                      <span>Verification Required</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950/90 border border-indigo-500/50 text-indigo-300">
                        {needsVerificationList.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      These schemes require completing identity verification (e.g. Aadhaar e-KYC) to finalize eligibility.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {needsVerificationList.map(renderSchemeCard)}
                </div>
              </section>
            )}

            {/* 6. INCOMPLETE PROFILE SECTION */}
            {incompleteList.length > 0 && (
              <section className="space-y-3" aria-labelledby="section-incomplete-profile">
                <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-2">
                  <div>
                    <h2
                      id="section-incomplete-profile"
                      className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2"
                    >
                      <span>Complete Your Profile</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/90 border border-amber-500/50 text-amber-300">
                        {incompleteList.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Provide missing profile fields to enable deterministic evaluation of these schemes.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {incompleteList.map(renderSchemeCard)}
                </div>
              </section>
            )}

            {/* 7. OTHER NOT ELIGIBLE SCHEMES (COLLAPSIBLE) */}
            {notEligibleList.length > 0 && (
              <section className="space-y-3 pt-2" aria-labelledby="section-ineligible">
                <button
                  type="button"
                  onClick={() => setShowIneligibleSection(!showIneligibleSection)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 hover:border-[#1C3127] text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h2 id="section-ineligible" className="text-sm font-bold text-slate-300 font-heading">
                      Other Analyzed Schemes (Not Eligible)
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-950/60 border border-rose-900/40 text-rose-400">
                      {notEligibleList.length}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    {showIneligibleSection ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {showIneligibleSection && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-2 animate-in fade-in duration-200">
                    {notEligibleList.map(renderSchemeCard)}
                  </div>
                )}
              </section>
            )}
          </div>
        ) : (
          /* TAB FILTER VIEW */
          <div className="space-y-4">
            {activeTab === 'ELIGIBLE' && (
              <div>
                <h2 className="text-base font-bold text-white font-heading mb-1">
                  Eligible Now Schemes ({eligibleNowList.length})
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Schemes meeting 100% of mandatory conditions.
                </p>
                {eligibleNowList.length === 0 ? (
                  <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-8 text-center flex flex-col items-center space-y-2">
                    <LandmarkIcon className="w-8 h-8 text-slate-500" />
                    <p className="text-sm font-bold text-white">No schemes confirmed eligible yet.</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Update your profile or check back later to discover new eligible welfare benefits.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {eligibleNowList.map(renderSchemeCard)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'IN_1_YEAR' && (
              <div>
                <h2 className="text-base font-bold text-white font-heading mb-1">
                  Eligible in 1 Year ({in1YearList.length})
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Schemes becoming available upon reaching the minimum age requirement in 1 year.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {in1YearList.map(renderSchemeCard)}
                </div>
              </div>
            )}

            {activeTab === 'IN_2_YEARS' && (
              <div>
                <h2 className="text-base font-bold text-white font-heading mb-1">
                  Eligible in 2 Years ({in2YearsList.length})
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Schemes becoming available upon reaching the minimum age requirement in 2 years.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {in2YearsList.map(renderSchemeCard)}
                </div>
              </div>
            )}

            {activeTab === 'IN_3_YEARS' && (
              <div>
                <h2 className="text-base font-bold text-white font-heading mb-1">
                  Eligible in 3 Years ({in3YearsList.length})
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Schemes becoming available upon reaching the minimum age requirement in 3 years.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {in3YearsList.map(renderSchemeCard)}
                </div>
              </div>
            )}

            {activeTab === 'NEEDS_VERIFICATION' && (
              <div>
                <h2 className="text-base font-bold text-white font-heading mb-1">
                  Verification Required ({needsVerificationList.length})
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Schemes awaiting Aadhaar or document verification.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {needsVerificationList.map(renderSchemeCard)}
                </div>
              </div>
            )}

            {activeTab === 'INCOMPLETE_PROFILE' && (
              <div>
                <h2 className="text-base font-bold text-white font-heading mb-1">
                  Incomplete Profile ({incompleteList.length})
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Schemes missing required profile data fields.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {incompleteList.map(renderSchemeCard)}
                </div>
              </div>
            )}

            {activeTab === 'NOT_ELIGIBLE' && (
              <div>
                <h2 className="text-base font-bold text-white font-heading mb-1">
                  Not Eligible Schemes ({notEligibleList.length})
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Schemes where mandatory eligibility criteria failed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {notEligibleList.map(renderSchemeCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
