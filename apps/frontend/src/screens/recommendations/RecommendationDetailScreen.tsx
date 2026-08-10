import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useRecommendation } from '../../hooks/useRecommendation';

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
    return <LoadingSpinner message="Fetching Scheme Recommendation Reasoning..." />;
  }

  if (isError || !recommendation) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-xs">
          <p className="text-sm font-semibold text-rose-600 mb-4">Could not load recommendation detail from server.</p>
          <Button title="Retry" onClick={() => refetch()} className="w-full mb-2 py-2.5" />
          <Button title="Back" variant="outline" onClick={onBack} className="w-full py-2.5" />
        </div>
      </main>
    );
  }

  const title = recommendation.scheme?.title || recommendation.title || `Scheme #${recommendation.schemeId.slice(0, 8)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
            ← Back to Recommendations
          </button>
          <span className="text-xs font-bold text-slate-500">Recommendation Analysis</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-md border border-blue-800">
          <div className="flex justify-between items-center mb-3">
            <Badge label={recommendation.isEligible ? 'ELIGIBLE' : 'ACTION REQUIRED'} variant={recommendation.isEligible ? 'success' : 'warning'} />
            <span className="text-xl font-extrabold text-amber-400">{recommendation.matchPercentage}% Match</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-2">{title}</h1>
          <p className="text-sm font-semibold text-blue-100">
            ₹{recommendation.estimatedBenefit.toLocaleString('en-IN')} Estimated Annual Benefit
          </p>
        </div>

        {/* Met Conditions */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 mb-3">
            Satisfied Criteria ({recommendation.criteriaMet?.length || 0})
          </h2>
          {recommendation.criteriaMet && recommendation.criteriaMet.length > 0 ? (
            <div className="space-y-2">
              {recommendation.criteriaMet.map((c, idx) => (
                <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center gap-3">
                  <span className="text-emerald-700 font-bold text-base">✓</span>
                  <span className="text-xs font-semibold text-slate-800">{c}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No evaluated criteria met.</p>
          )}
        </Card>

        {/* Missing Conditions */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 mb-3">
            Missing Conditions ({recommendation.missingCriteria?.length || 0})
          </h2>
          {recommendation.missingCriteria && recommendation.missingCriteria.length > 0 ? (
            <div className="space-y-2">
              {recommendation.missingCriteria.map((m, idx) => (
                <div key={idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center gap-3">
                  <span className="text-amber-700 font-bold text-base">⚠️</span>
                  <span className="text-xs font-semibold text-slate-800">{m}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Zero missing conditions! You satisfy all scheme requirements.</p>
          )}
        </Card>

        {/* Missing Required Documents */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 mb-3">
            Missing Vault Documents ({recommendation.missingDocuments?.length || 0})
          </h2>
          {recommendation.missingDocuments && recommendation.missingDocuments.length > 0 ? (
            <div className="space-y-2">
              {recommendation.missingDocuments.map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <Badge label={doc} variant="warning" />
                  <span className="text-xs text-slate-500 font-medium">Required for application submission</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">All required documents uploaded.</p>
          )}
        </Card>

        {/* Explanation Button */}
        <Button
          title="View Full Natural Language Explanation →"
          variant="secondary"
          onClick={() => onViewExplanation(recommendation.id)}
          className="w-full py-3.5 font-bold shadow-md"
        />
      </main>
    </div>
  );
};
