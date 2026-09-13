import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useRecommendations } from '../../hooks/useRecommendations';
import { SchemeRecommendationItem } from '../../services/recommendation.service';
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ArrowRightIcon,
} from '../../components/ui/Icons';

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
  const [filter, setFilter] = useState<'ELIGIBLE' | 'INCOMPLETE_PROFILE' | 'NOT_ELIGIBLE' | 'ALL'>('ELIGIBLE');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const eligibleCount = recommendations.filter((r) => r.isEligible).length;
  const incompleteCount = recommendations.filter((r) => !r.isEligible && (r.eligibilityStatus === 'INCOMPLETE_PROFILE' || (r.missingProfileFields && r.missingProfileFields.length > 0))).length;
  const notEligibleCount = recommendations.filter((r) => !r.isEligible && (r.eligibilityStatus === 'NOT_ELIGIBLE' || (!r.missingProfileFields || r.missingProfileFields.length === 0))).length;

  const filteredRecs = recommendations.filter((r) => {
    if (filter === 'ELIGIBLE') return r.isEligible;
    if (filter === 'INCOMPLETE_PROFILE') {
      return !r.isEligible && (r.eligibilityStatus === 'INCOMPLETE_PROFILE' || (r.missingProfileFields && r.missingProfileFields.length > 0));
    }
    if (filter === 'NOT_ELIGIBLE') {
      return !r.isEligible && (r.eligibilityStatus === 'NOT_ELIGIBLE' || (!r.missingProfileFields || r.missingProfileFields.length === 0));
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
                ← Back
              </button>
            )}
            <h1 className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-100">
              Scheme Eligibility Engine
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
              {recommendations.length} Schemes Analyzed
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Header & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Deterministic Eligibility Evaluation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated strictly against verified citizen demographics and official scheme rules.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('ELIGIBLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                filter === 'ELIGIBLE'
                  ? 'bg-emerald-800 dark:bg-emerald-700 border-emerald-800 dark:border-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              Eligible ({eligibleCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('INCOMPLETE_PROFILE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                filter === 'INCOMPLETE_PROFILE'
                  ? 'bg-amber-800 dark:bg-amber-700 border-amber-800 dark:border-amber-700 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              Incomplete Profile ({incompleteCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('NOT_ELIGIBLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                filter === 'NOT_ELIGIBLE'
                  ? 'bg-rose-800 dark:bg-rose-700 border-rose-800 dark:border-rose-700 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              Requirements Not Met ({notEligibleCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                filter === 'ALL'
                  ? 'bg-blue-900 dark:bg-blue-700 border-blue-900 dark:border-blue-700 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              All ({recommendations.length})
            </button>
          </div>
        </div>

        {/* Floating Compare Bar */}
        {selectedForCompare.length > 1 && (
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-700 flex justify-between items-center animate-fade-in">
            <span className="text-xs font-bold text-slate-200">
              {selectedForCompare.length} Schemes Selected for Side-by-Side Analysis
            </span>
            <Button
              title="Compare Schemes →"
              variant="secondary"
              size="sm"
              onClick={() => onCompareRecommendations(selectedForCompare)}
            />
          </div>
        )}

        {/* Recommendations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height={160} className="rounded-xl" />
            <Skeleton height={160} className="rounded-xl" />
          </div>
        ) : isError ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold mb-4">
              Unable to calculate scheme recommendations.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-900 dark:bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
            >
              Retry Rules Engine
            </button>
          </div>
        ) : filteredRecs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 italic text-sm">
            {filter === 'ELIGIBLE'
              ? 'No schemes currently satisfy 100% of eligibility rules with your current profile. Check "Incomplete Profile" to update missing fields.'
              : 'No schemes match the selected filter category.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecs.map((item: SchemeRecommendationItem) => {
              const isSelected = selectedForCompare.includes(item.id);
              const title = item.scheme?.title || item.title || `Scheme #${item.schemeId.slice(0, 8)}`;
              const category = item.scheme?.category || item.category || 'WELFARE';
              const isIncomplete = !item.isEligible && (item.eligibilityStatus === 'INCOMPLETE_PROFILE' || (item.missingProfileFields && item.missingProfileFields.length > 0));
              const isFailed = !item.isEligible && !isIncomplete;

              return (
                <Card
                  key={item.id}
                  onClick={() => onSelectRecommendation(item.id)}
                  className="cursor-pointer hover:border-blue-700 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label
                        onClick={(e) => toggleSelectForCompare(item.id, e)}
                        className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-900 dark:text-blue-500 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                        />
                        <span>{item.scheme?.code || item.code || 'SCHEME'}</span>
                      </label>
                      <Badge label={category} variant="primary" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 leading-snug">
                      {title}
                    </h3>

                    <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center mb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">
                          Eligibility Score
                        </span>
                        <span className={`text-base font-extrabold ${item.isEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {item.matchPercentage}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">
                          Est. Benefit
                        </span>
                        <span className="text-base font-extrabold text-blue-900 dark:text-blue-300">
                          ₹{item.estimatedBenefit.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Status Reason Notice */}
                    {item.statusReason && !item.isEligible && (
                      <div className="mb-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Note: </span>
                        <span>{item.statusReason}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.isEligible
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : isIncomplete
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {item.isEligible ? (
                        <>
                          <CheckCircleIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>ELIGIBLE</span>
                        </>
                      ) : isIncomplete ? (
                        <>
                          <AlertTriangleIcon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>INCOMPLETE PROFILE</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          <span>NOT ELIGIBLE</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-400 hover:underline flex items-center gap-1">
                      <span>View Reasoning</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
