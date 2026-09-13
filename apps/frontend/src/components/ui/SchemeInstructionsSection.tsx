import React, { useState, useEffect, useRef } from 'react';
import { wsService } from '../../services/websocket-client';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  BotIcon,
  DocumentTextIcon,
  AlertTriangleIcon,
  RefreshIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
} from './Icons';

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
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [schemeTitle, schemeId]);

  const handleFetchInstructions = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await wsService.requestSchemeGuidance({
        schemeTitle,
        schemeId,
        abortSignal: abortControllerRef.current.signal,
      });
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
      if (err.name === 'AbortError') return;
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
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-900 dark:bg-blue-600 text-white flex items-center justify-center shrink-0">
              <BotIcon className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Official Step-by-Step Application Procedure
            </h2>
          </div>

          {/* Action Trigger Button */}
          {hasLoaded ? (
            <button
              onClick={toggleSectionOpen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
            >
              {isSectionOpen ? (
                <>
                  <ChevronUpIcon className="w-3.5 h-3.5" />
                  <span>Hide Guidance</span>
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                  <span>Show Guidance</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleFetchInstructions}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs shadow-xs transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <DocumentTextIcon className="w-3.5 h-3.5" />
                  <span>Get Detailed Guidance</span>
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
              <AlertTriangleIcon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-semibold">Guidance Engine Notice:</span>
              <span>{errorMessage || 'Unable to generate detailed guidance right now. Please try again.'}</span>
            </div>
            <button
              onClick={handleFetchInstructions}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
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

              {/* Bottom Fade when collapsed */}
              {!isExpanded && (
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 via-white/70 dark:via-slate-900/70 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Show More / Show Less Toggle Button */}
            <div className="pt-2 flex justify-center border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
              >
                {isExpanded ? (
                  <>
                    <span>Hide Guidance</span>
                    <ChevronUpIcon className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Show More</span>
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : !hasLoaded ? (
          /* Initial Unloaded State */
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 flex items-center justify-center text-sm shrink-0">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Detailed Official Application Procedure
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Click &quot;Get Detailed Guidance&quot; to generate comprehensive prerequisites, document checklists, official portal steps, and tracking procedures for {schemeTitle}.
              </p>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Official Government Portal Apply Redirect Button */}
      <div className="p-5 bg-slate-900 dark:bg-slate-900 text-white rounded-2xl border border-slate-700 dark:border-slate-700 shadow-sm text-center space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Ready to Submit Your Application?
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click below to proceed directly to the verified official government portal for {schemeTitle}.
          </p>
        </div>

        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 text-white bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 font-bold text-sm rounded-xl shadow-xs transition-colors border border-blue-700 dark:border-blue-500"
        >
          <span>Apply Now on Official Portal</span>
          <ArrowRightIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
