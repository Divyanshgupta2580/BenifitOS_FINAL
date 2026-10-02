import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ArrowLeftIcon, SparklesIcon, AlertTriangleIcon, ScaleIcon, FileTextIcon, CheckCircle2Icon } from '../../components/ui/Icons';
import { useRecommendationComparison } from '../../hooks/useRecommendationComparison';
import { AppLayout } from '../../components/layout/AppLayout';

interface Props {
  recommendationIds: string[];
  onBack: () => void;
}

export const RecommendationComparisonScreen: React.FC<Props> = ({ recommendationIds, onBack }) => {
  const { comparedRecommendations, isLoading, isError, refetch } = useRecommendationComparison(recommendationIds);

  if (isLoading) {
    return (
      <AppLayout activeTab="schemes">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner message="Generating side-by-side scheme comparison matrix..." />
        </div>
      </AppLayout>
    );
  }

  if (isError || comparedRecommendations.length === 0) {
    return (
      <AppLayout activeTab="schemes">
        <div className="w-full max-w-md mx-auto py-16 px-4">
          <div className="bg-[#0E1712] p-8 rounded-3xl border border-rose-900/40 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-rose-300 mb-6">
              Unable to load side-by-side scheme comparison data.
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

  return (
    <AppLayout activeTab="schemes">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C3127]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint-400 hover:text-mint-300 transition-colors mr-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                Side-by-Side Scheme Comparison Matrix
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Comparative view of benefits, matching criteria, and document requirements.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-forest-950 border border-[#1C3127] text-mint-300">
            {comparedRecommendations.length} Schemes Selected
          </span>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {comparedRecommendations.map((rec) => {
            const title = rec.scheme?.title || rec.title || `Scheme #${rec.schemeId.slice(0, 8)}`;
            return (
              <div
                key={rec.id}
                className="rounded-3xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex justify-between items-center">
                    <Badge
                      label={rec.isEligible ? 'ELIGIBLE' : 'ACTION NEEDED'}
                      variant={rec.isEligible ? 'success' : 'warning'}
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {rec.scheme?.code || 'SCHEME'}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-bold text-white font-heading line-clamp-2 min-h-[48px]">
                    {title}
                  </h2>

                  {/* Attributes Matrix */}
                  <div className="space-y-2.5 pt-2">
                    <div className="p-3 bg-forest-950/70 rounded-xl border border-[#1C3127] flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Match Score</span>
                      <span className="text-sm font-black text-emerald-400">{rec.matchPercentage}%</span>
                    </div>

                    <div className="p-3 bg-forest-950/70 rounded-xl border border-[#1C3127] flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Annual Direct Benefit</span>
                      <span className="text-sm font-black text-amber-300">
                        ₹{rec.estimatedBenefit.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-3 bg-forest-950/70 rounded-xl border border-[#1C3127] flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Criteria Met</span>
                      <span className="text-xs font-bold text-mint-300">
                        {rec.criteriaMet?.length || 0} Rules
                      </span>
                    </div>

                    <div className="p-3 bg-forest-950/70 rounded-xl border border-[#1C3127] flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Missing Documents</span>
                      <span className="text-xs font-bold text-rose-300">
                        {rec.missingDocuments?.length || 0} Required
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1C3127]/80 flex justify-end">
                  <span className="text-[11px] text-slate-500">
                    ID: {rec.schemeId.slice(0, 8)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Back Action */}
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs bg-forest-950 hover:bg-forest-900 text-slate-200 border border-[#1C3127] transition-all cursor-pointer"
        >
          ← Return to Scheme Recommendations List
        </button>
      </div>
    </AppLayout>
  );
};
