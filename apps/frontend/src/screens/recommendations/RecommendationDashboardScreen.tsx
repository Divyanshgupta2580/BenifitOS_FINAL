import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useRecommendations } from '../../hooks/useRecommendations';
import { SchemeRecommendationItem } from '../../services/recommendation.service';

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
  const [filter, setFilter] = useState<'ALL' | 'ELIGIBLE' | 'ACTION_REQUIRED'>('ALL');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const filteredRecs = recommendations.filter((r) => {
    if (filter === 'ELIGIBLE') return r.isEligible;
    if (filter === 'ACTION_REQUIRED') return !r.isEligible;
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
            <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400">Scheme Recommendations Engine</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">{recommendations.length} Matches Found</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Header & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-blue-900 dark:text-blue-400">Deterministic Match Score Dashboard</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Evaluated against verified citizen profile attributes.</p>
          </div>

          <div className="flex gap-2">
            {(['ALL', 'ELIGIBLE', 'ACTION_REQUIRED'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  filter === tab
                    ? 'bg-blue-900 dark:bg-blue-700 border-blue-900 dark:border-blue-700 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {tab === 'ALL' ? `All (${recommendations.length})` : tab === 'ELIGIBLE' ? 'Eligible' : 'Action Needed'}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Compare Bar */}
        {selectedForCompare.length > 1 && (
          <div className="bg-blue-950 text-white p-4 rounded-xl shadow-md border border-blue-800 flex justify-between items-center animate-fade-in">
            <span className="text-xs font-bold text-blue-100">{selectedForCompare.length} Schemes Selected for Side-by-Side Analysis</span>
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
            <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold mb-4">Unable to calculate scheme recommendations.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-900 dark:bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
            >
              Retry Rules Engine
            </button>
          </div>
        ) : filteredRecs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 italic text-sm">
            No recommendations match the selected filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecs.map((item: SchemeRecommendationItem) => {
              const isSelected = selectedForCompare.includes(item.id);
              const title = item.scheme?.title || item.title || `Scheme #${item.schemeId.slice(0, 8)}`;
              const category = item.scheme?.category || item.category || 'WELFARE';

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
                        className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-700 dark:text-amber-400"
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

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</h3>

                    <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center mb-4">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Match Score</span>
                        <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{item.matchPercentage}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Est. Benefit</span>
                        <span className="text-base font-extrabold text-amber-700 dark:text-amber-400">₹{item.estimatedBenefit.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Badge
                      label={item.isEligible ? 'ELIGIBLE' : 'ACTION REQUIRED'}
                      variant={item.isEligible ? 'success' : 'warning'}
                    />
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-400 hover:underline">View Reasoning →</span>
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
