import React from 'react';
import { StarIcon, ArrowRightIcon, LandmarkIcon } from '../ui/Icons';
import { StateEmblemOfIndia } from './GovernmentEmblem';
import { SchemeRecommendationItem } from '../../services/recommendation.service';

interface TopRecommendedSchemeCardProps {
  topScheme?: SchemeRecommendationItem;
  onNavigateToRecommendations: () => void;
  onSelectScheme?: (schemeId?: string) => void;
}

export const TopRecommendedSchemeCard: React.FC<TopRecommendedSchemeCardProps> = ({
  topScheme,
  onNavigateToRecommendations,
  onSelectScheme,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
            Top Recommended Scheme
          </h2>
        </div>

        <button
          type="button"
          onClick={onNavigateToRecommendations}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
        >
          <span>View All Matches</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Body */}
      {topScheme ? (
        <div
          onClick={() => {
            if (onSelectScheme && (topScheme.schemeId || topScheme.id)) {
              onSelectScheme(topScheme.schemeId || topScheme.id);
            } else {
              onNavigateToRecommendations();
            }
          }}
          className="group p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700/80 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Left: Emblem + Title + Dept + Description */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-100/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-900 dark:text-blue-300 shrink-0 shadow-xs">
              <StateEmblemOfIndia className="w-7 h-9 text-slate-800 dark:text-slate-200" />
            </div>

            <div className="space-y-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                {topScheme.title || topScheme.scheme?.title || 'Government Welfare Scheme'}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {topScheme.department || topScheme.scheme?.department || 'Government of India'}
              </p>
              {(topScheme.scheme?.description || (topScheme as any).description) && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {topScheme.scheme?.description || (topScheme as any).description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Match Score Badge + Benefit Amount */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
              {topScheme.matchPercentage}% Match
            </span>
            <span className="text-base sm:text-lg font-black text-blue-950 dark:text-blue-300 tracking-tight">
              ₹{topScheme.estimatedBenefit.toLocaleString('en-IN')} / Year
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <LandmarkIcon className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No scheme recommendation calculated yet
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Complete your citizen demographics, household, and land details in Profile to automatically unlock scheme matches.
          </p>
        </div>
      )}
    </div>
  );
};
