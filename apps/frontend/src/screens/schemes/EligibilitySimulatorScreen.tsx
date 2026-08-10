import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useEligibility } from '../../hooks/useEligibility';

interface Props {
  schemeId: string;
  onBack: () => void;
}

export const EligibilitySimulatorScreen: React.FC<Props> = ({ schemeId, onBack }) => {
  const { eligibilityMatch, isLoading, isError, refetch } = useEligibility(schemeId);

  if (isLoading) {
    return <LoadingSpinner message="Evaluating Deterministic Backend Eligibility Rules..." />;
  }

  if (isError || !eligibilityMatch) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-xs">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Eligibility Engine Unavailable</h2>
          <p className="text-xs text-slate-600 mb-6">Complete your citizen profile to enable rule evaluation.</p>
          <Button title="Retry Evaluation" onClick={() => refetch()} className="w-full mb-2 py-2.5" />
          <Button title="Back to Scheme" variant="outline" onClick={onBack} className="w-full py-2.5" />
        </div>
      </main>
    );
  }

  const isEligible = eligibilityMatch.isEligible;
  const matchScore = eligibilityMatch.matchPercentage;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
            ← Back to Scheme Detail
          </button>
          <h1 className="text-lg font-bold text-blue-900">Eligibility Rule Simulator</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Match Score Card */}
        <div className="bg-blue-900 text-white rounded-2xl p-8 shadow-md border border-blue-800 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-4">
            Backend Rules Result
          </span>

          <div className="w-32 h-32 rounded-full border-8 border-amber-400 flex flex-col items-center justify-center bg-blue-950/60 mb-4 shadow-inner">
            <span className="text-3xl font-black text-white">{matchScore}%</span>
            <span className="text-[10px] text-blue-200 font-bold uppercase">Match</span>
          </div>

          <Badge
            label={isEligible ? 'ELIGIBLE CITIZEN' : 'ACTION REQUIRED'}
            variant={isEligible ? 'success' : 'warning'}
            className="mb-4 text-xs py-1 px-3"
          />

          <p className="text-lg font-extrabold text-amber-400">
            Estimated Benefit: ₹{eligibilityMatch.estimatedBenefit.toLocaleString('en-IN')} / Year
          </p>
        </div>

        {/* Deterministic Evaluation Note */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 mb-2">Deterministic Rule Engine Security</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eligibility is computed 100% deterministically by the BenefitOS backend rules evaluator using strict boolean logic operators. AI LLMs are never permitted to generate or alter eligibility scores.
          </p>
        </Card>

        <Button title="Back to Scheme" onClick={onBack} className="w-full py-3 font-bold" />
      </main>
    </div>
  );
};
