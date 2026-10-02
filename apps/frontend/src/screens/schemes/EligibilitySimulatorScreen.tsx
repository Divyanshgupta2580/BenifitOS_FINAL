import React from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useEligibility } from '../../hooks/useEligibility';
import { AppLayout } from '../../components/layout/AppLayout';
import { CheckCircle2Icon, AlertTriangleIcon, ShieldCheckIcon, ArrowRightIcon } from '../../components/ui/Icons';

interface Props {
  schemeId: string;
  onBack: () => void;
}

export const EligibilitySimulatorScreen: React.FC<Props> = ({ schemeId, onBack }) => {
  const { eligibilityMatch, isLoading, isError, refetch } = useEligibility(schemeId);

  if (isLoading) {
    return (
      <AppLayout activeTab="schemes">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner message="Evaluating Deterministic Backend Eligibility Rules..." />
        </div>
      </AppLayout>
    );
  }

  if (isError || !eligibilityMatch) {
    return (
      <AppLayout activeTab="schemes">
        <main className="flex flex-col justify-center items-center min-h-[60vh] p-6 text-center">
          <div className="bg-[#0E1712] p-8 rounded-2xl border border-[#1C3127]/80 max-w-md w-full shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-rose-300">Eligibility Engine Unavailable</h2>
            <p className="text-xs text-slate-400">Complete your citizen profile to enable rule evaluation.</p>
            <button
              onClick={() => refetch()}
              className="w-full py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs transition-colors"
            >
              Retry Evaluation
            </button>
            <button
              onClick={onBack}
              className="w-full py-2.5 rounded-xl bg-forest-900 border border-[#1C3127] text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Back to Scheme
            </button>
          </div>
        </main>
      </AppLayout>
    );
  }

  const isEligible = eligibilityMatch.isEligible;
  const matchScore = eligibilityMatch.matchPercentage;

  return (
    <AppLayout activeTab="schemes">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-mint-400 hover:underline inline-flex items-center gap-1"
          >
            <span>← Back to Scheme Detail</span>
          </button>
          <span className="text-xs font-bold text-slate-400">Rule Simulator</span>
        </div>

        {/* Match Score Card */}
        <div className="rounded-2xl bg-gradient-to-b from-forest-950 to-[#0A1812] border border-[#1C3127]/80 p-8 shadow-xl flex flex-col items-center text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-mint-400">
            Backend Rules Result
          </span>

          {/* Glowing Circular Match Score Meter */}
          <div className="w-32 h-32 rounded-full border-4 border-mint-500/50 bg-forest-900/60 shadow-lg shadow-mint-500/10 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white font-heading">{matchScore}%</span>
            <span className="text-[10px] text-mint-300 font-bold uppercase tracking-wider">Match</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isEligible
                ? 'bg-emerald-950/90 border border-emerald-500/40 text-mint-300'
                : 'bg-amber-950/90 border border-amber-500/40 text-amber-300'
            }`}
          >
            {isEligible ? (
              <CheckCircle2Icon className="w-4 h-4 text-mint-400" />
            ) : (
              <AlertTriangleIcon className="w-4 h-4 text-amber-400" />
            )}
            <span>{isEligible ? 'ELIGIBLE CITIZEN' : 'ACTION REQUIRED'}</span>
          </div>

          <p className="text-base sm:text-lg font-extrabold text-mint-300">
            Estimated Benefit: ₹{eligibilityMatch.estimatedBenefit.toLocaleString('en-IN')} / Year
          </p>
        </div>

        {/* Deterministic Evaluation Note */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-lg space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-mint-400" />
            <h2 className="text-sm sm:text-base font-bold text-white font-heading">
              Deterministic Rule Engine Security
            </h2>
          </div>
          <p className="text-xs text-slate-300/90 leading-relaxed">
            Eligibility is computed 100% deterministically by the BenefitOS backend rules evaluator using strict boolean logic operators. AI models are strictly prohibited from calculating or modifying your official eligibility scores.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm transition-all shadow-md"
        >
          <span>Back to Scheme</span>
          <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </AppLayout>
  );
};
