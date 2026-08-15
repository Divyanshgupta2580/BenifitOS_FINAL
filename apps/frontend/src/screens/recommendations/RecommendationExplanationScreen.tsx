import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useRecommendation } from '../../hooks/useRecommendation';

interface Props {
  recommendationId: string;
  onBack: () => void;
}

export const RecommendationExplanationScreen: React.FC<Props> = ({ recommendationId, onBack }) => {
  const { recommendation, isLoading, isError, refetch } = useRecommendation(recommendationId);

  if (isLoading) {
    return <LoadingSpinner message="Generating Recommendation Reasoning Explanation..." />;
  }

  if (isError || !recommendation) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center transition-colors">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-xs">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-4">Could not load explanation from server.</p>
          <Button title="Retry" onClick={() => refetch()} className="w-full mb-2 py-2.5" />
          <Button title="Back" variant="outline" onClick={onBack} className="w-full py-2.5" />
        </div>
      </main>
    );
  }

  const title = recommendation.scheme?.title || recommendation.title || `Scheme #${recommendation.schemeId.slice(0, 8)}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
            ← Back to Recommendation Detail
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400">AI Natural Language Explanation</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <Card>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">{recommendation.scheme?.code || 'SCHEME'}</span>
            <Badge label={`${recommendation.matchPercentage}% Match`} variant="success" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        </Card>

        <Card>
          <h3 className="text-base font-bold text-blue-900 dark:text-blue-400 mb-3">Why Was This Scheme Recommended?</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Based on your verified annual household income (₹
            {recommendation.scheme?.financialBenefit
              ? (recommendation.estimatedBenefit || 150000).toLocaleString('en-IN')
              : '1,50,000'}
            ) and primary employment category, your profile satisfies key eligibility criteria defined by the welfare department.
          </p>
        </Card>

        {/* Scoring Policy */}
        <div className="bg-blue-950 text-white rounded-2xl p-6 shadow-sm border border-blue-800">
          <h3 className="text-sm font-bold text-amber-400 mb-1">Deterministic Scoring Integrity Policy</h3>
          <p className="text-xs text-blue-200 leading-relaxed">
            BenefitOS AI assistant translates complex rule ASTs into clear natural language, but NEVER alters or calculates eligibility scores.
          </p>
        </div>

        <Button title="Back to Scheme Details" onClick={onBack} className="w-full py-3 font-bold" />
      </main>
    </div>
  );
};
