import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CheckCircleIcon, AlertTriangleIcon, ArrowLeftIcon, SparklesIcon, FileTextIcon, ShieldCheckIcon } from '../../components/ui/Icons';
import { useRecommendation } from '../../hooks/useRecommendation';
import { SchemeInstructionsSection } from '../../components/ui/SchemeInstructionsSection';
import { AppLayout } from '../../components/layout/AppLayout';

interface Props {
  recommendationId: string;
  onBack: () => void;
  onViewExplanation: (id: string) => void;
}

export const RecommendationDetailScreen: React.FC<Props> = ({
  recommendationId,
  onBack,
  onViewExplanation,
}) => {
  const { recommendation, isLoading, isError, refetch } = useRecommendation(recommendationId);

  if (isLoading) {
    return (
      <AppLayout activeTab="schemes">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner message="Evaluating scheme criteria and recommendation reasoning..." />
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
              Could not load recommendation details from the central welfare registry.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-mint-500 hover:bg-mint-400 text-forest-950 shadow-md transition-all"
              >
                Retry Query
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-forest-950/80 hover:bg-forest-900 text-slate-300 border border-[#1C3127] transition-all"
              >
                Back to Recommendations
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
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-mint-400 hover:text-mint-300 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Recommendations</span>
          </button>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-forest-950 border border-[#1C3127] text-slate-300">
            {recommendation.scheme?.code || 'SCHEME'}
          </span>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D2418] via-[#0E1712] to-[#0A120E] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge
                label={recommendation.isEligible ? 'ELIGIBLE TO APPLY' : 'ACTION REQUIRED'}
                variant={recommendation.isEligible ? 'success' : 'warning'}
              />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-950/80 border border-emerald-500/40 text-emerald-400 font-extrabold text-sm">
                <SparklesIcon className="w-4 h-4 text-emerald-400" />
                <span>{recommendation.matchPercentage}% Match</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight leading-snug">
              {title}
            </h1>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-forest-950/60 border border-[#1C3127] text-amber-300 font-bold text-sm">
              <span>₹{recommendation.estimatedBenefit.toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-400 font-normal">Estimated Annual Direct Benefit</span>
            </div>
          </div>
        </div>

        {/* Met Criteria */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Satisfied Criteria ({recommendation.criteriaMet?.length || 0})
              </h2>
              <p className="text-[11px] text-slate-400">Rules matched from your citizen profile records</p>
            </div>
          </div>

          {recommendation.criteriaMet && recommendation.criteriaMet.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {recommendation.criteriaMet.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-900/50 flex items-start gap-3"
                >
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-emerald-100">{c}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No evaluated criteria met.</p>
          )}
        </div>

        {/* Missing Criteria */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <AlertTriangleIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Missing Conditions ({recommendation.missingCriteria?.length || 0})
              </h2>
              <p className="text-[11px] text-slate-400">Unmet threshold or missing qualification attributes</p>
            </div>
          </div>

          {recommendation.missingCriteria && recommendation.missingCriteria.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {recommendation.missingCriteria.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-amber-950/30 rounded-xl border border-amber-900/50 flex items-start gap-3"
                >
                  <AlertTriangleIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-amber-100">{m}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-mint-400/90 font-medium">
              ✓ Zero missing conditions! You satisfy all scheme requirements.
            </p>
          )}
        </div>

        {/* Missing Vault Documents */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/50 flex items-center justify-center text-sky-400">
              <FileTextIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Missing Vault Documents ({recommendation.missingDocuments?.length || 0})
              </h2>
              <p className="text-[11px] text-slate-400">Certificates needed to proceed with direct disbursement</p>
            </div>
          </div>

          {recommendation.missingDocuments && recommendation.missingDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendation.missingDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-forest-950/70 rounded-xl border border-[#1C3127] flex items-center justify-between gap-3"
                >
                  <span className="text-xs font-bold text-slate-200">{doc}</span>
                  <Badge label="Required" variant="warning" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-mint-400/90 font-medium">
              ✓ No additional documents are required for this scheme.
            </p>
          )}
        </div>

        {/* AI Natural Language Explanation Action */}
        <button
          type="button"
          onClick={() => onViewExplanation(recommendation.id)}
          className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-mint-500 to-emerald-400 hover:from-mint-400 hover:to-emerald-300 text-forest-950 shadow-xl shadow-mint-500/10 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <SparklesIcon className="w-5 h-5 text-forest-950" />
          <span>View Full AI Natural Language Explanation →</span>
        </button>

        {/* Step-by-Step Instructions */}
        <SchemeInstructionsSection schemeTitle={title} schemeId={recommendation.schemeId} />
      </div>
    </AppLayout>
  );
};
