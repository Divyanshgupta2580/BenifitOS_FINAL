import React, { useState } from 'react';
import { aiApiService } from '../../services/ai.service';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Props {
  schemeTitle: string;
  schemeId?: string;
  defaultApplyUrl?: string;
}

export const SchemeInstructionsSection: React.FC<Props> = ({ schemeTitle, schemeId, defaultApplyUrl }) => {
  const [instructions, setInstructions] = useState<string>('');
  const [applicationUrl, setApplicationUrl] = useState<string>(defaultApplyUrl || 'https://www.india.gov.in/my-government/schemes');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSectionOpen, setIsSectionOpen] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleFetchInstructions = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const res = await aiApiService.getSchemeInstructions({ schemeTitle, schemeId });
      if (res && res.instructions && res.instructions.trim().length > 0) {
        setInstructions(res.instructions);
        if (res.applicationUrl) {
          setApplicationUrl(res.applicationUrl);
        }
        setHasLoaded(true);
        setIsSectionOpen(true);
      } else {
        setIsError(true);
        setErrorMessage('No detailed guidance was returned. Please try again.');
      }
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err?.message || 'Unable to generate detailed guidance right now. Please verify your connection or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSectionOpen = () => {
    if (!hasLoaded) {
      handleFetchInstructions();
    } else {
      setIsSectionOpen((prev) => !prev);
    }
  };

  return (
    <div className="space-y-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
      {/* AI Generated Instructions Card */}
      <Card className="border-blue-200 dark:border-blue-800/80 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-extrabold text-blue-900 dark:text-blue-300">
              AI Step-by-Step Application Instructions
            </h2>
          </div>

          {/* Action Trigger Button */}
          {hasLoaded ? (
            <button
              onClick={toggleSectionOpen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSectionOpen ? (
                <>
                  <span>⌃</span>
                  <span>Hide Guidance</span>
                </>
              ) : (
                <>
                  <span>⌄</span>
                  <span>Show Guidance</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleFetchInstructions}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-500/40"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Get Detailed AI Guidance</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Dynamic Card Body */}
        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner message="Generating start-to-finish application instructions for this scheme..." />
          </div>
        ) : isError ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold">⚠️ Guidance Engine Notice:</span>
              <span>{errorMessage || 'Unable to generate detailed guidance right now. Please try again.'}</span>
            </div>
            <button
              onClick={handleFetchInstructions}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>🔄</span>
              <span>Try Again</span>
            </button>
          </div>
        ) : hasLoaded && isSectionOpen ? (
          <div className="space-y-4">
            {/* Guidance Content with Expandable Wrapper */}
            <div
              className={`transition-all duration-300 ${
                isExpanded ? 'max-h-none' : 'max-h-[380px] overflow-hidden relative'
              }`}
            >
              <MarkdownRenderer content={instructions} />

              {/* Bottom Gradient Fade when collapsed */}
              {!isExpanded && (
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-50/95 dark:from-slate-900/95 via-blue-50/50 dark:via-slate-900/50 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Show More / Show Less Toggle Button */}
            <div className="pt-2 flex justify-center border-t border-slate-200/60 dark:border-slate-800/60">
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isExpanded ? (
                  <>
                    <span>Hide Guidance</span>
                    <span>▲</span>
                  </>
                ) : (
                  <>
                    <span>Show More</span>
                    <span>▼</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : !hasLoaded ? (
          /* Initial Unloaded State */
          <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 text-base shrink-0">
                ✨
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Detailed Official Application Procedure
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click to generate comprehensive prerequisites, document checklists, official portal steps, and DBT payment tracking for {schemeTitle}.
                </p>
              </div>
            </div>
            <button
              onClick={handleFetchInstructions}
              className="whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>✨</span>
              <span>Get Detailed AI Guidance</span>
            </button>
          </div>
        ) : null}
      </Card>

      {/* Official Government Portal Apply Redirect Button */}
      <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl border border-emerald-700 shadow-lg text-center space-y-3">
        <div>
          <h3 className="text-sm font-bold text-emerald-200 uppercase tracking-wider">
            Ready to Submit Your Application?
          </h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Click below to proceed directly to the verified official government portal for {schemeTitle}.
          </p>
        </div>

        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 text-white bg-emerald-600 hover:bg-emerald-500 font-black text-base rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] border border-emerald-400/40"
        >
          <span>Apply Now on Official Portal</span>
          <span className="text-xs font-mono font-normal opacity-90">({applicationUrl})</span>
          <span className="text-lg">↗</span>
        </a>
      </div>
    </div>
  );
};
