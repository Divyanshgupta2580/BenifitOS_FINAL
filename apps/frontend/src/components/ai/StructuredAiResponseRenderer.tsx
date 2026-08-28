import React, { useState } from 'react';
import {
  BotIcon,
  CheckCircleIcon,
  CheckIcon,
  LandmarkIcon,
  DocumentTextIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  InfoIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../ui/Icons';

interface StructuredAiResponseProps {
  content: string;
  sources?: string[];
  timestamp?: string;
  onActionClick?: (actionQuery: string) => void;
  onNavigateToSchemes?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToApplications?: () => void;
}

interface ParsedScheme {
  title: string;
  department?: string;
  eligibilityStatus?: string;
  benefit?: string;
  whyApply?: string;
  documents?: string[];
  nextStep?: string;
  officialUrl?: string;
}

interface ParsedApplicationStep {
  stepNumber: string;
  title: string;
  description: string;
}

export const StructuredAiResponseRenderer: React.FC<StructuredAiResponseProps> = ({
  content,
  sources = ['Government Database', 'Citizen Profile'],
  timestamp,
  onActionClick,
  onNavigateToSchemes,
  onNavigateToVault,
  onNavigateToApplications,
}) => {
  // Parse schemes from text if present
  const parseSchemes = (text: string): ParsedScheme[] => {
    const schemes: ParsedScheme[] = [];
    
    // Match headers like ### Scheme Title or 01 Scheme Title or **1. Scheme Title**
    const schemeRegex = /(?:###\s*|\b0[1-9]\s+|\b[1-9]\.\s+\*\*|\*\*\d+\.\s+)([^\n*#]+)(?:[\s\S]*?)(?=(?:###\s*|\b0[1-9]\s+|\b[1-9]\.\s+\*\*|\*\*\d+\.\s+)|$)/gi;
    let match;

    while ((match = schemeRegex.exec(text)) !== null) {
      const block = match[0];
      const rawTitle = match[1].replace(/\*\*/g, '').replace(/\[|\]/g, '').trim();

      // Only treat as scheme if title looks like a scheme or has department/benefit keywords
      if (
        rawTitle.length > 3 &&
        (block.toLowerCase().includes('eligibility') ||
          block.toLowerCase().includes('benefit') ||
          block.toLowerCase().includes('department') ||
          block.toLowerCase().includes('ministry') ||
          rawTitle.toLowerCase().includes('yojana') ||
          rawTitle.toLowerCase().includes('scheme') ||
          rawTitle.toLowerCase().includes('pm-') ||
          rawTitle.toLowerCase().includes('pm '))
      ) {
        const deptMatch = block.match(/(?:Department|Ministry|Authority)[\s/:]*([^\n]+)/i);
        const eligMatch = block.match(/(?:Eligibility(?:\s*Status)?|Status)[\s/:]*([^\n]+)/i);
        const benefitMatch = block.match(/(?:Benefit|Estimated Benefit|Financial Benefit)[\s/:]*([^\n]+)/i);
        const whyMatch = block.match(/(?:Why this may apply|Why it is relevant|Why you qualify)[\s/:]*([^\n]+(?:\n[^\n#*]+)?)/i);
        const nextMatch = block.match(/(?:Next Step|How to proceed|Next action)[\s/:]*([^\n]+)/i);
        const urlMatch = block.match(/(https?:\/\/[^\s)]+)/);

        // Extract bullet documents
        const docLines: string[] = [];
        const docSectionMatch = block.match(/(?:Required Documents|Documents Required|Documents)[\s/:]*([\s\S]*?)(?=(?:Next Step|Why|Benefit|Eligibility|###|\b0[1-9]|$))/i);
        if (docSectionMatch) {
          const lines = docSectionMatch[1].split('\n');
          for (const line of lines) {
            const clean = line.replace(/^[\s*•\-–\d.)]+/, '').trim();
            if (clean.length > 2 && !clean.toLowerCase().startsWith('next step')) {
              docLines.push(clean);
            }
          }
        }

        schemes.push({
          title: rawTitle,
          department: deptMatch ? deptMatch[1].replace(/\*\*/g, '').trim() : undefined,
          eligibilityStatus: eligMatch ? eligMatch[1].replace(/\*\*/g, '').trim() : 'Appears relevant based on available information',
          benefit: benefitMatch ? benefitMatch[1].replace(/\*\*/g, '').trim() : undefined,
          whyApply: whyMatch ? whyMatch[1].replace(/\*\*/g, '').trim() : undefined,
          documents: docLines.length > 0 ? docLines.slice(0, 5) : undefined,
          nextStep: nextMatch ? nextMatch[1].replace(/\*\*/g, '').trim() : undefined,
          officialUrl: urlMatch ? urlMatch[1] : undefined,
        });
      }
    }

    return schemes;
  };

  // Parse application steps (01, 02, 03...)
  const parseApplicationSteps = (text: string): ParsedApplicationStep[] => {
    const steps: ParsedApplicationStep[] = [];
    const stepRegex = /(?:^|\n)(?:Step\s*(\d+)|\b0(\d)|\b(\d+)\.)[\s:.-]+([^\n]+)(?:\n([\s\S]*?))(?=(?:\n(?:Step\s*\d+|\b0\d|\b\d+\.)|\n\n###|$))/gi;
    let match;

    while ((match = stepRegex.exec(text)) !== null) {
      const num = match[1] || match[2] || match[3] || '01';
      const title = match[4].replace(/\*\*/g, '').trim();
      const desc = match[5] ? match[5].replace(/\*\*/g, '').trim() : '';

      if (title.length > 2) {
        steps.push({
          stepNumber: num.length === 1 ? `0${num}` : num,
          title,
          description: desc,
        });
      }
    }

    return steps;
  };

  const parsedSchemes = parseSchemes(content);
  const isApplicationFlow =
    content.toLowerCase().includes('how to apply') ||
    content.toLowerCase().includes('application procedure') ||
    content.toLowerCase().includes('step-by-step application');
  const parsedSteps = isApplicationFlow ? parseApplicationSteps(content) : [];

  // Clean raw intro text
  const getIntroText = (): string => {
    let intro = content;
    if (parsedSchemes.length > 0) {
      const firstSchemeIdx = content.search(/(?:###\s*|\b01\s+|\b1\.\s+\*\*|\*\*1\.\s+)/i);
      if (firstSchemeIdx > 10) {
        intro = content.substring(0, firstSchemeIdx).trim();
      } else {
        intro = '';
      }
    } else if (parsedSteps.length > 0) {
      const firstStepIdx = content.search(/(?:Step\s*1|\b01|\b1\.)/i);
      if (firstStepIdx > 10) {
        intro = content.substring(0, firstStepIdx).trim();
      }
    }
    return intro.replace(/#{1,6}\s*/g, '').trim();
  };

  const introText = getIntroText();

  return (
    <div className="w-full space-y-4">
      {/* Official AI Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-900 dark:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BotIcon className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-blue-950 dark:text-blue-200 tracking-tight">
                BenefitOS AI Citizen Copilot
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                Official Assistant
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              National Welfare Intelligence Service
            </span>
          </div>
        </div>

        {/* Verified Data Source Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          {sources.map((source, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <CheckCircleIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{source}</span>
            </span>
          ))}
          {timestamp && (
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] ml-1">
              {timestamp}
            </span>
          )}
        </div>
      </div>

      {/* Intro Summary Text */}
      {introText && (
        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
          <p className="whitespace-pre-wrap">{introText}</p>
        </div>
      )}

      {/* Render Scheme Cards if multiple schemes detected */}
      {parsedSchemes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Identified Relevant Welfare Schemes ({parsedSchemes.length})</span>
            </span>
          </div>

          <div className="space-y-3.5">
            {parsedSchemes.map((scheme, sIdx) => (
              <SchemeCardItem
                key={sIdx}
                scheme={scheme}
                index={sIdx + 1}
                onActionClick={onActionClick}
                onNavigateToSchemes={onNavigateToSchemes}
              />
            ))}
          </div>
        </div>
      )}

      {/* Render Application Steps if detected */}
      {parsedSteps.length > 0 && parsedSchemes.length === 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 px-1">
            <DocumentTextIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Step-by-Step Official Application Procedure
            </h3>
          </div>

          <div className="space-y-2.5">
            {parsedSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-900 dark:bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h4>
                  {step.description && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback Clean General Text if no structured schemes */}
      {parsedSchemes.length === 0 && parsedSteps.length === 0 && !introText && (
        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      )}

      {/* Official Government Disclaimer Banner */}
      <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <InfoIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">Official Notice:</strong>{' '}
          Scheme recommendations and guidance are based on verified information available in your BenefitOS profile. Final eligibility, benefit disbursement, and application approval are determined exclusively by the concerned Government Ministry or implementing department.
        </p>
      </div>

      {/* Contextual Quick Actions */}
      <div className="pt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onActionClick && onActionClick('Check my eligibility for these schemes')}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold transition-all shadow-xs"
        >
          Check Eligibility
        </button>

        <button
          type="button"
          onClick={() => onActionClick && onActionClick('What documents do I need to prepare?')}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold transition-all shadow-xs"
        >
          Documents Required
        </button>

        <button
          type="button"
          onClick={() => onActionClick && onActionClick('How do I apply step by step?')}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold transition-all shadow-xs"
        >
          How to Apply
        </button>

        {onNavigateToSchemes && (
          <button
            type="button"
            onClick={onNavigateToSchemes}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            View All Schemes →
          </button>
        )}
      </div>
    </div>
  );
};

interface SchemeCardItemProps {
  scheme: ParsedScheme;
  index: number;
  onActionClick?: (query: string) => void;
  onNavigateToSchemes?: () => void;
}

const SchemeCardItem: React.FC<SchemeCardItemProps> = ({
  scheme,
  index,
  onActionClick,
  onNavigateToSchemes,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
      {/* Top Tag & Number */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-black flex items-center justify-center">
            {index < 10 ? `0${index}` : index}
          </span>
          {scheme.department && (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {scheme.department}
            </span>
          )}
        </div>

        {/* Eligibility Status Badge */}
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {scheme.eligibilityStatus || 'Appears Relevant'}
        </span>
      </div>

      {/* Scheme Title */}
      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
        {scheme.title}
      </h3>

      {/* Benefit Highlight if present */}
      {scheme.benefit && (
        <div className="mt-2 text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Benefit:</span>
          <span>{scheme.benefit}</span>
        </div>
      )}

      {/* Why This May Apply */}
      {scheme.whyApply && (
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Why this may apply:</span>{' '}
          {scheme.whyApply}
        </div>
      )}

      {/* Expandable Documents & Next Step Section */}
      {scheme.documents && scheme.documents.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Required Documents:
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{isExpanded ? 'Hide Details' : 'View Checklist'}</span>
              {isExpanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
            </button>
          </div>

          {isExpanded && (
            <ul className="space-y-1.5 pt-1">
              {scheme.documents.map((doc, dIdx) => (
                <li key={dIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Next Action Step */}
      {scheme.nextStep && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-slate-100">Next Step:</span>{' '}
          <span>{scheme.nextStep}</span>
        </div>
      )}

      {/* Card Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onActionClick && onActionClick(`Check eligibility details for ${scheme.title}`)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-900 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-slate-700 transition-colors"
          >
            Check Eligibility
          </button>

          <button
            type="button"
            onClick={() => onActionClick && onActionClick(`Explain how to apply for ${scheme.title}`)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            How to Apply
          </button>
        </div>

        {scheme.officialUrl && (
          <a
            href={scheme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>Official Portal</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
