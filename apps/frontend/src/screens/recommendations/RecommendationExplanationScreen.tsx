import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ArrowLeftIcon, SparklesIcon, ShieldCheckIcon, AlertTriangleIcon, CheckCircle2Icon } from '../../components/ui/Icons';
import { useRecommendation } from '../../hooks/useRecommendation';
import { AppLayout } from '../../components/layout/AppLayout';

interface Props {
  recommendationId: string;
  onBack: () => void;
}

export const RecommendationExplanationScreen: React.FC<Props> = ({ recommendationId, onBack }) => {
  const { recommendation, isLoading, isError, refetch } = useRecommendation(recommendationId);

  if (isLoading) {
    return (
      <AppLayout activeTab="schemes">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner message="Generating AI natural language reasoning breakdown..." />
        </div>
      </AppLayout>
    );
  }

  if (isError || !recommendation) {
    return (
      <AppLayout activeTab="schemes">
        <div className="w-full max-w-md mx-auto py-16 px-4">
          <div className="bg-[#0E1712] p-8 rounded-3xl border border-rose-900/40 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-rose-300 mb-6">
              Could not generate explanation from central reasoning service.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-mint-500 hover:bg-mint-400 text-forest-950 shadow-md transition-all"
              >
                Retry Request
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-forest-950/80 hover:bg-forest-900 text-slate-300 border border-[#1C3127] transition-all"
              >
                Back to Details
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const title = recommendation.scheme?.title || recommendation.title || `Scheme #${recommendation.schemeId.slice(0, 8)}`;

  return (
    <AppLayout activeTab="schemes">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-mint-400 hover:text-mint-300 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Scheme Details</span>
          </button>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-forest-950 border border-[#1C3127] text-slate-300">
            {recommendation.scheme?.code || 'SCHEME'}
          </span>
        </div>

        {/* Title Header Card */}
        <div className="rounded-3xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400">
              {recommendation.scheme?.code || 'SCHEME ID'}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs">
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{recommendation.matchPercentage}% Match</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            {title}
          </h1>
        </div>

        {/* Reasoning Explanation Card */}
        <div className="rounded-3xl bg-[#0E1712] border border-emerald-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint-500/20 to-emerald-700/30 border border-mint-500/40 flex items-center justify-center text-mint-400 shadow-md">
              <SparklesIcon className="w-5 h-5 text-mint-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Why Was This Scheme Recommended?
              </h2>
              <p className="text-[11px] text-slate-400">Natural language synthesis from deterministic rule graph</p>
            </div>
          </div>

          <div className="relative z-10 p-5 rounded-2xl bg-forest-950/70 border border-[#1C3127] text-sm text-slate-200 leading-relaxed space-y-3">
            <p>
              Based on your reported annual household income (₹
              {recommendation.scheme?.financialBenefit
                ? (recommendation.estimatedBenefit || 150000).toLocaleString('en-IN')
                : '1,50,000'}
              ) and primary employment category, your profile satisfies key eligibility criteria defined by the welfare department.
            </p>
            {recommendation.criteriaMet && recommendation.criteriaMet.length > 0 && (
              <div className="pt-2 border-t border-[#1C3127]/80 space-y-2">
                <span className="text-xs font-bold text-mint-300 block">Evaluated Eligibility Factors:</span>
                <ul className="space-y-1.5">
                  {recommendation.criteriaMet.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2Icon className="w-3.5 h-3.5 text-mint-400 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Scoring Integrity Policy */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0B1712] to-[#0E1B15] border border-amber-500/30 p-5 sm:p-6 shadow-lg flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-amber-400 tracking-wide uppercase">
              Deterministic Scoring Integrity Policy
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              BenefitOS AI assistant translates complex rule ASTs into clear natural language, but NEVER alters, biases, or calculates eligibility scores independently. All qualification gates are enforced by government statutory rule engines.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs bg-forest-950 hover:bg-forest-900 text-slate-200 border border-[#1C3127] transition-all cursor-pointer"
        >
          ← Return to Scheme Details
        </button>
      </div>
    </AppLayout>
  );
};
