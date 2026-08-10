import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useRecommendationComparison } from '../../hooks/useRecommendationComparison';

interface Props {
  recommendationIds: string[];
  onBack: () => void;
}

export const RecommendationComparisonScreen: React.FC<Props> = ({ recommendationIds, onBack }) => {
  const { comparedRecommendations, isLoading, isError, refetch } = useRecommendationComparison(recommendationIds);

  if (isLoading) {
    return <LoadingSpinner message="Building Scheme Comparison Matrix..." />;
  }

  if (isError || comparedRecommendations.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-xs">
          <p className="text-sm font-semibold text-rose-600 mb-4">Unable to load scheme comparison data.</p>
          <Button title="Retry" onClick={() => refetch()} className="w-full mb-2 py-2.5" />
          <Button title="Back" variant="outline" onClick={onBack} className="w-full py-2.5" />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
            ← Back to Recommendations
          </button>
          <h1 className="text-lg font-bold text-blue-900">Side-by-Side Scheme Comparison Matrix</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-blue-900 mb-4">Comparative Analysis</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparedRecommendations.map((rec) => {
              const title = rec.scheme?.title || rec.title || `Scheme #${rec.schemeId.slice(0, 8)}`;
              return (
                <div key={rec.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <Badge label={rec.isEligible ? 'ELIGIBLE' : 'ACTION NEEDED'} variant={rec.isEligible ? 'success' : 'warning'} />
                      <span className="text-xs font-mono font-bold text-slate-500">{rec.scheme?.code || 'SCHEME'}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-4 line-clamp-2 min-h-[48px]">{title}</h3>

                    <div className="space-y-3 mb-6">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Match Score</span>
                        <span className="text-sm font-black text-emerald-700">{rec.matchPercentage}%</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Annual Benefit</span>
                        <span className="text-sm font-black text-amber-700">₹{rec.estimatedBenefit.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Criteria Met</span>
                        <span className="text-xs font-bold text-slate-900">{rec.criteriaMet?.length || 0} Rules</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Missing Documents</span>
                        <span className="text-xs font-bold text-slate-900">{rec.missingDocuments?.length || 0} Docs</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button title="Back to Recommendations List" onClick={onBack} className="w-full py-3 font-bold" />
      </main>
    </div>
  );
};
